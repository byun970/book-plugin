#!/usr/bin/env node
// PreToolUse 훅: todo-api MCP 도구 호출을 call-log.jsonl에 기록한다.
import { appendFileSync } from "node:fs";
import path from "node:path";

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(input);
    const logPath = path.join(process.env.CLAUDE_PLUGIN_ROOT ?? ".", "hooks", "call-log.jsonl");
    const line = JSON.stringify({
      time: new Date().toISOString(),
      tool: event.tool_name,
      input: event.tool_input,
    });
    appendFileSync(logPath, line + "\n");
  } catch (error) {
    process.stderr.write(`log-call 훅 오류: ${error.message}\n`);
  }
  process.exit(0);
});
