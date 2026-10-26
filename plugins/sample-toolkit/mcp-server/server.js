#!/usr/bin/env node
// openapi.json을 읽어 operationId마다 MCP 도구를 동적으로 등록하는 실습용 MCP 서버.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(path.join(__dirname, "openapi.json"), "utf-8"));
const baseUrl = process.env.API_BASE || spec.servers?.[0]?.url;

function buildInputSchema(operation) {
  const properties = {};
  const required = [];

  for (const param of operation.parameters ?? []) {
    properties[param.name] = {
      ...(param.schema ?? { type: "string" }),
      description: param.description,
    };
    if (param.required) required.push(param.name);
  }

  const bodySchema = operation.requestBody?.content?.["application/json"]?.schema;
  if (bodySchema?.properties) {
    Object.assign(properties, bodySchema.properties);
    if (bodySchema.required) required.push(...bodySchema.required);
  }

  return { type: "object", properties, required };
}

const tools = [];
for (const [routePath, methods] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(methods)) {
    tools.push({
      name: operation.operationId,
      description: `[${method.toUpperCase()} ${routePath}] ${operation.summary ?? ""}`,
      inputSchema: buildInputSchema(operation),
      route: { method: method.toUpperCase(), routePath },
    });
  }
}

const server = new Server(
  { name: "sample-toolkit-todo-api", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ route, ...tool }) => tool),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((t) => t.name === request.params.name);
  if (!tool) {
    return {
      isError: true,
      content: [{ type: "text", text: `알 수 없는 도구: ${request.params.name}` }],
    };
  }

  const args = request.params.arguments ?? {};
  let urlPath = tool.route.routePath;
  const query = new URLSearchParams();
  const bodyFields = {};

  for (const [key, value] of Object.entries(args)) {
    if (urlPath.includes(`{${key}}`)) {
      urlPath = urlPath.replace(`{${key}}`, encodeURIComponent(String(value)));
    } else if (tool.route.method === "GET") {
      query.set(key, String(value));
    } else {
      bodyFields[key] = value;
    }
  }

  const queryString = query.toString();
  const url = `${baseUrl}${urlPath}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      method: tool.route.method,
      headers: { "Content-Type": "application/json" },
      body: tool.route.method === "GET" ? undefined : JSON.stringify(bodyFields),
    });
    const data = await response.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `API 호출 실패: ${error.message}` }],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
