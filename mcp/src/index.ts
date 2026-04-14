import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path, { parse } from 'path';
const server = new McpServer({
  name: 'mcp server',
  version: '0.1.0',
});
server.resource(
  'user-details',
  new ResourceTemplate('users://{userId', { list: undefined }),
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
        content: [{ type: 'text', text: 'failed to save user' }],
      };
    }
  },
);
async function createUser(param: {
  name: string;
  email: string;
  address?: string;
}) {
  // const dataPath = require.resolve('./data/user.json');
  const dataPath = path.join(__dirname, '../src/data/user.json');
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
