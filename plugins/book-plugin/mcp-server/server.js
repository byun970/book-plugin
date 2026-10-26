#!/usr/bin/env node
// openapi.json을 읽어 operationId마다 MCP 도구를 동적으로 등록하는 실습용 MCP 서버.
// 외부 npm 의존성 없이 Node 기본 모듈만으로 MCP stdio(JSON-RPC, 줄 단위) 프로토콜을 직접 구현한다.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
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

function validateArgs(tool, args) {
  const errors = [];
  const schema = tool.inputSchema;
  const allowedKeys = new Set(Object.keys(schema.properties ?? {}));

  for (const key of Object.keys(args)) {
    if (!allowedKeys.has(key)) {
      errors.push(`스펙에 정의되지 않은 파라미터: ${key}`);
    }
  }

  for (const key of schema.required ?? []) {
    const value = args[key];
    if (value === undefined || value === null || value === "") {
      errors.push(`필수 필드 누락: ${key}`);
    }
  }

  for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
    if (args[key] === undefined || args[key] === null) continue;
    const value = args[key];
    const type = propSchema.type;
    if (type === "integer" && !Number.isInteger(Number(value))) {
      errors.push(`${key}는 integer여야 합니다 (받은 값: ${JSON.stringify(value)})`);
    } else if (type === "number" && Number.isNaN(Number(value))) {
      errors.push(`${key}는 number여야 합니다 (받은 값: ${JSON.stringify(value)})`);
    } else if (type === "boolean" && typeof value !== "boolean") {
      errors.push(`${key}는 boolean이어야 합니다 (받은 값: ${JSON.stringify(value)})`);
    } else if (type === "string" && typeof value !== "string") {
      errors.push(`${key}는 string이어야 합니다 (받은 값: ${JSON.stringify(value)})`);
    }
  }

  return errors;
}

async function callTool(name, args) {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return { isError: true, content: [{ type: "text", text: `알 수 없는 도구: ${name}` }] };
  }

  const validationErrors = validateArgs(tool, args ?? {});
  if (validationErrors.length > 0) {
    // openapi.json의 각 operation에 정의된 400 응답(ErrorResponse)과 같은 형태로 맞춘다.
    const errorPayload = { error: "validation_error", status: 400, detail: validationErrors };
    return { isError: true, content: [{ type: "text", text: JSON.stringify(errorPayload, null, 2) }] };
  }

  const effectiveArgs = { ...args };
  for (const [key, propSchema] of Object.entries(tool.inputSchema.properties ?? {})) {
    if (effectiveArgs[key] === undefined && propSchema.default !== undefined) {
      effectiveArgs[key] = propSchema.default;
    }
  }

  let urlPath = tool.route.routePath;
  const query = new URLSearchParams();
  const bodyFields = {};

  for (const [key, value] of Object.entries(effectiveArgs)) {
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
    const text = await response.text();

    if (!response.ok) {
      let detail;
      try {
        detail = text ? JSON.parse(text) : null;
      } catch {
        detail = text;
      }
      // openapi.json의 components.schemas.ErrorResponse와 같은 형태로 맞춘다.
      const errorPayload = { error: response.statusText || `HTTP ${response.status}`, status: response.status, detail };
      return { isError: true, content: [{ type: "text", text: JSON.stringify(errorPayload, null, 2) }] };
    }

    const data = text ? JSON.parse(text) : null;
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (error) {
    const errorPayload = { error: "network_error", status: 0, detail: error.message };
    return { isError: true, content: [{ type: "text", text: JSON.stringify(errorPayload, null, 2) }] };
  }
}

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

const rl = createInterface({ input: process.stdin });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = request;
  const isNotification = id === undefined;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "book-plugin-book-api", version: "0.3.1" },
      },
    });
    return;
  }

  if (method === "notifications/initialized" || isNotification) {
    return;
  }

  if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: tools.map(({ route, ...tool }) => tool) } });
    return;
  }

  if (method === "tools/call") {
    const result = await callTool(params?.name, params?.arguments);
    send({ jsonrpc: "2.0", id, result });
    return;
  }

  send({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `알 수 없는 메서드: ${method}` },
  });
});
