import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import { CreateMessageResultSchema } from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
import { McpError } from '@modelcontextprotocol/sdk/types.js';
const __dirname = path.dirname(__filename);
const server = new McpServer({
  name: 'mcp server',
  version: '0.1.0',
});
server.resource(
  'user-details',
  new ResourceTemplate('users://{userId}', { list: undefined }),
  {
    description: 'get user details from database',
    title: 'user details',
    mimeType: 'application/json',
  },
  async (uri, { userId }) => {
    const dataPath = path.join(__dirname, '../src/data/user.json');
    const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const user = users.find((u: any) => u.id == parseInt(userId as string));
    if (user == null) {
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: 'user not found' }),
            mimeType: 'application/json',
          },
        ],
      };
    }
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(user),
          mimeType: 'application/json',
        },
      ],
    };
  },
);
server.resource(
  'users',
  'users://all',
  {
    description: 'get all users from to datbase',
    title: 'users',
    mimeType: 'application/json',
  },
  async (uri) => {
    const dataPath = path.join(__dirname, '../src/data/user.json');
    const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(users),
          mimeType: 'application/json',
        },
      ],
    };
  },
);

server.tool(
  'create_user',
  'create a new user in the database',
  {
    name: z.string(),
    email: z.string(),
    address: z.string(),
  },
  {
    title: 'Create User',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async (param) => {
    try {
      const id = await createUser(param);
      return {
        content: [{ type: 'text', text: `user created with id ${id}` }],
      };
    } catch (error) {
      return {
        content: [
          { type: 'text', text: 'failed to save user' + String(error) },
        ],
      };
    }
  },
);
server.tool(
  'create-ramdom-user',
  'create a random user in the database',
  {
    title: 'Create random user',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => {
    let fakeUser: { name: string; email: string; address: string };
    try {
      const result = await server.server.request(
        {
          method: 'sampling/createMessage',
          params: {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: 'Generate fake user JSON with fields: name, email, address. Return ONLY JSON.',
                },
              },
            ],
            maxTokens: 300,
          },
        },
        CreateMessageResultSchema,
      );
      if (result.content.type !== 'text') {
        throw new Error('sampling returned non-text content');
      }
      fakeUser = JSON.parse(
        result.content.text
          .trim()
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/, ''),
      );
    } catch (err: unknown) {
      // fallback quando cliente MCP não suporta sampling (erro -32601)
      const msg = String(err);
      const isMethodNotFound =
        msg.includes('-32601') || msg.includes('Method not found');
      if (!isMethodNotFound) {
        return {
          content: [{ type: 'text', text: `failed to generate user: ${msg}` }],
          isError: true,
        };
      }
      fakeUser = generateLocalFakeUser();
    }
    try {
      const id = await createUser(fakeUser);
      return {
        content: [{ type: 'text', text: `user created with id ${id}` }],
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `failed to save user: ${String(err)}` }],
        isError: true,
      };
    }
  },
);
// util local: sempre funciona sem LLM/sampling
function generateLocalFakeUser(): { name: string; email: string; address: string } {
  const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fabio'];
  const lastNames = ['Silva', 'Souza', 'Oliveira', 'Costa', 'Mendes', 'Lima'];
  const streets = ['Rua A', 'Rua B', 'Av. Central', 'Rua das Flores', 'Alameda 2'];
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${first} ${last}`;
  const email = `${first?.toLowerCase()}.${last?.toLowerCase()}${Math.floor(Math.random() * 999)}@example.com`;
  const address = `${streets[Math.floor(Math.random() * streets.length)]}, ${Math.floor(Math.random() * 900 + 100)}`;
  return { name, email, address };
}
server.prompt(
  'generate-fake-user',
  'genearete a fake user based on a given name',
  {
    name: z.string(),
  },
  ({ name }) => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `generate a fake user with name ${name}`,
          },
        },
      ],
    };
  },
);
async function createUser(param: {
  name: string;
  email: string;
  address?: string;
}) {
  // const dataPath = require.resolve('./data/user.json');
  const dataPath = fileURLToPath(new URL('../src/data/user.json', import.meta.url));
  const users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const id = users.length + 1;
  users.push({ id, ...param });
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
  return id;
}
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main();
