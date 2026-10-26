# sample-toolkit

실습용 Claude Code 플러그인. 아래 다섯 요소를 모두 포함합니다.

| 구성요소 | 위치 | 설명 |
| :- | :- | :- |
| OpenAPI 스펙 | `mcp-server/openapi.json` | Todo API 일부(`listTodos`, `getTodoById`, `createTodo`)를 정의 |
| MCP 서버 | `mcp-server/server.js` | openapi.json을 읽어 operationId마다 MCP 도구를 동적으로 등록, jsonplaceholder.typicode.com에 실제 호출. 외부 npm 의존성 없이 Node 기본 모듈만 사용 |
| Skill | `skills/todo-briefing/SKILL.md` | todo-api 도구로 할 일을 조회해 표 형태로 요약 |
| Hook | `hooks/hooks.json`, `hooks/log-call.js` | todo-api 도구 호출 전마다 `hooks/call-log.jsonl`에 기록 |
| Agent | `agents/api-reviewer.md` | 도구 호출 결과가 OpenAPI 스펙과 일치하는지 검토하는 읽기 전용 리뷰어 |

## 로컬에서 바로 써보기 (마켓플레이스 배포 전)

```bash
claude --plugin-dir ./plugins/sample-toolkit
```

세션 안에서 "할 일 5개 보여줘" 라고 물어보면 `todo-briefing` 스킬과 `todo-api` MCP 도구가 동작합니다.

## 깃허브에서 설치

```
/plugin install sample-toolkit --marketplace byun970/wori-sample-plugin
```

또는 CLI에서:

```bash
claude plugin marketplace add byun970/wori-sample-plugin
claude plugin install sample-toolkit@wori-sample-marketplace
```

## 검증

```bash
claude plugin validate ./plugins/sample-toolkit --strict
```
