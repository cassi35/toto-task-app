"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const server = new mcp_js_1.McpServer({
    name: 'mcp server',
    version: '0.1.0',
});
server.resource('users', 'users://all', {
    description: 'get all users from to datbase',
    title: 'users',
    mimeType: 'application/json',
}, async (uri) => {
    const dataPath = path_1.default.join(__dirname, '../src/data/user.json');
    const users = JSON.parse(fs_1.default.readFileSync(dataPath, 'utf-8'));
    return {
        contents: [
            {
                uri: uri.href,
                text: JSON.stringify(users),
                mimeType: 'application/json',
            },
        ],
    };
});
server.tool('create_user', 'create a new user in the database', {
    name: zod_1.z.string(),
    email: zod_1.z.string(),
    address: zod_1.z.string(),
}, {
    title: 'Create User',
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
}, async (param) => {
    try {
        const id = await createUser(param);
        return {
            content: [{ type: 'text', text: `user created with id ${id}` }],
        };
    }
    catch (error) {
        return {
            content: [{ type: 'text', text: 'failed to save user' }],
        };
    }
});
async function createUser(param) {
    // const dataPath = require.resolve('./data/user.json');
    const dataPath = path_1.default.join(__dirname, '../src/data/user.json');
    const users = JSON.parse(fs_1.default.readFileSync(dataPath, 'utf-8'));
    const id = users.length + 1;
    users.push({ id, ...param });
    fs_1.default.writeFileSync(dataPath, JSON.stringify(users, null, 2));
    return id;
}
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main();
//# sourceMappingURL=index.js.map