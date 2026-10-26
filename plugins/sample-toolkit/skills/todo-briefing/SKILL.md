---
name: todo-briefing
description: sample-toolkit의 todo-api MCP 도구로 할 일 목록을 조회해 한국어로 간결하게 요약 브리핑한다. "할 일 알려줘", "todo 브리핑", "오늘 할 일 정리해줘" 같은 요청에 사용한다.
---

# Todo 브리핑

sample-toolkit 플러그인의 todo-api MCP 서버가 제공하는 도구(`listTodos`, `getTodoById`, `createTodo`)로 할 일을 조회하고 정리한다.

## 절차
1. 사용자가 사용자 ID나 개수를 언급하면 `listTodos`의 `userId`, `_limit` 인자로 전달한다.
2. 결과를 완료(`completed: true`)와 미완료로 나눈다.
3. 다음 형식의 마크다운 표로 응답한다: `ID | 제목 | 상태`.
4. 도구 호출 결과에 없는 항목은 추측해서 만들어내지 않는다.
