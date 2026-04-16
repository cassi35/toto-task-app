import 'dotenv/config';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { confirm, select, input } from '@inquirer/prompts';
import { createOpenAI } from '@ai-sdk/openai';
import {
  Tool,
  CreateMessageRequestSchema,
  Prompt,
  PromptMessage,
} from '@modelcontextprotocol/sdk/types.js';
import { generateText, jsonSchema, ToolSet } from 'ai';
const openrouter = createOpenAI({
  apiKey: process.env.GOOGLE_OLLAMA_API_KEY,
  baseURL: process.env.BASE_URL,
});
const mcp = new Client(
  {
    name: 'mcp client',
    version: '0.1.0',
  },
  {
    capabilities: { sampling: {} },
  },
);
const transport = new StdioClientTransport({
  command: 'node',
  args: ['build/index.js'],
  stderr: 'ignore',
});
async function main() {
  await mcp.connect(transport);
  const [{ resources }, { prompts }, { tools }, { resourceTemplates }] =
    await Promise.all([
      mcp.listResources(),
      mcp.listPrompts(),
      mcp.listTools(),
      mcp.listResourceTemplates(),
    ]);
  console.log('you are conncted');
  while (true) {
    const option = await select({
      message: 'what do you want to do ?',
      choices: ['Query', 'Tools', 'Resources', 'Prompts'],
    });
    switch (option) {
      case 'Tools':
        const toolName = await select({
          message: 'select a tool',
          choices: tools.map((tool) =>
            tool.description
              ? {
                  name: tool.annotations?.title || tool.name,
                  value: tool.name,
                  description: tool.description,
                }
              : {
                  name: tool.annotations?.title || tool.name,
                  value: tool.name,
                },
          ),
        });
        const tool = tools.find((t) => t.name === toolName);
        if (tool == null) {
          console.error(`tool ${toolName} not found`);
        } else {
          await handleTool(tool);
        }
        break;
      case 'Resources':
        const resourceUri = await select({
          message: 'Select a resource',
          choices: [
            ...resources.map((resource) =>
              resource.description
                ? {
                    name: resource.name,
                    value: resource.uri,
                    description: resource.description,
                  }
                : { name: resource.name, value: resource.uri },
            ),
            ...resourceTemplates.map((template) =>
              template.description
                ? {
                    name: template.name,
                    value: template.uriTemplate,
                    description: template.description,
                  }
                : { name: template.name, value: template.uriTemplate },
            ),
          ],
        });
        const uri =
          resources.find((r) => r.uri === resourceUri)?.uri ??
          resourceTemplates.find((r) => r.uriTemplate === resourceUri)
            ?.uriTemplate;
        if (uri == null) {
          console.error('Resource not found.');
        } else {
          await handleResource(uri);
        }
        break;
      case 'Prompts':
        const promptName = await select({
          message: 'Select a prompt',
          choices: prompts.map((p) =>
            p.description
              ? { name: p.name, value: p.name, description: p.description }
              : { name: p.name, value: p.name },
          ),
        });
        const prompt = prompts.find((p) => p.name === promptName);
        if (prompt == null) {
          console.error('Prompt not found.');
        } else {
          await handlePrompt(prompt);
        }
        break;
      case 'Query':
        await handleQuery(tools);
    }
  }
}
async function handleQuery(tools: Tool[]) {
  const query = await input({ message: 'Enter your query' });

  const aiTools: ToolSet = tools.reduce((acc, mcpTool) => {
    acc[mcpTool.name] = {
      ...(mcpTool.description ? { description: mcpTool.description } : {}),
      inputSchema: jsonSchema(mcpTool.inputSchema),
      execute: async (args) => {
        return await mcp.callTool({
          name: mcpTool.name,
          arguments: args as Record<string, unknown>,
        });
      },
    };

    return acc;
  }, {} as ToolSet);

  const { text, toolResults } = await generateText({
    model: openrouter('google/gemma-4-26b-a4b-it:free'),
    prompt: query,
    tools: aiTools,
  });

  console.log(
    text || JSON.stringify(toolResults[0]?.output) || 'No text generated.',
  );
}
async function handleTool(tool: Tool) {
  const args: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    tool.inputSchema.properties ?? {},
  )) {
    args[key] = await input({
      message: `Enter value for ${key} (${(value as { type: string }).type}:)`,
    });
  }
  const result = await mcp.callTool({
    name: tool.name,
    arguments: args,
  });
  console.log((result.content as [{ text: string }])[0].text);
}
async function handleResource(uri: string) {
  let finalUri = uri;
  const paramMatches = uri.match(/{([^}]+)}/g);

  if (paramMatches != null) {
    for (const paramMatch of paramMatches) {
      const paramName = paramMatch.replace('{', '').replace('}', '');
      const paramValue = await input({
        message: `Enter value for ${paramName}:`,
      });
      finalUri = finalUri.replace(paramMatch, paramValue);
    }
  }

  const res = await mcp.readResource({
    uri: finalUri,
  });

  console.log(
    JSON.stringify(
      JSON.parse((res.contents[0] as { text: string }).text),
      null,
      2,
    ),
  );
}
async function handlePrompt(prompt: Prompt) {
  const args: Record<string, string> = {};
  for (const arg of prompt.arguments ?? []) {
    args[arg.name] = await input({
      message: `Enter value for ${arg.name}:`,
    });
  }

  const response = await mcp.getPrompt({
    name: prompt.name,
    arguments: args,
  });

  for (const message of response.messages) {
    console.log(await handleServerMessagePrompt(message));
  }
}

async function handleServerMessagePrompt(message: PromptMessage) {
  if (message.content.type !== 'text') return;

  console.log(message.content.text);
  const run = await confirm({
    message: 'Would you like to run the above prompt',
    default: true,
  });

  if (!run) return;

  const { text } = await generateText({
    model: openrouter('google/gemma-4-26b-a4b-it:free'),
    prompt: message.content.text,
  });

  return text;
}
main();
