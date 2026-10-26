# book-plugin

실습용 Claude Code 플러그인. Open Library 공개 API(키 불필요)로 책을 검색·추천하며, 아래 다섯 요소를 모두 포함합니다.

| 구성요소 | 위치 | 설명 |
| :- | :- | :- |
| OpenAPI 스펙 | `mcp-server/openapi.json` | Book Discovery API(`searchBooks`, `getWorkDetails`, `recommendBySubject`)를 정의 |
| MCP 서버 | `mcp-server/server.js` | openapi.json을 읽어 operationId마다 MCP 도구를 동적으로 등록, openlibrary.org에 실제 호출. 외부 npm 의존성 없이 Node 기본 모듈만 사용 |
| Skill | `skills/book-recommender/SKILL.md` | book-api 도구로 책을 검색·추천해 표 형태로 요약 |
| Hook | `hooks/hooks.json`, `hooks/log-call.js` | book-api 도구 호출 전마다 `hooks/call-log.jsonl`에 기록 |
| Agent | `agents/api-reviewer.md` | 도구 호출 결과가 OpenAPI 스펙과 일치하는지 검토하는 읽기 전용 리뷰어 |

## 로컬에서 바로 써보기 (마켓플레이스 배포 전)

```bash
claude --plugin-dir ./plugins/book-plugin
```

세션 안에서 "SF 소설 3권만 추천해줘" 라고 물어보면 `book-recommender` 스킬과 `book-api` MCP 도구가 동작합니다.

## 깃허브에서 설치

```
/plugin install book-plugin --marketplace byun970/book-plugin
```

또는 CLI에서:

```bash
claude plugin marketplace add byun970/book-plugin
claude plugin install book-plugin@wori-sample-marketplace
```

## 검증

```bash
claude plugin validate ./plugins/book-plugin --strict
```

## 평가(eval)

`evals/book-recommender-basic/`에 프롬프트(`prompt.md`)와 LLM 채점 기준(`graders/criteria.md`)이 있습니다.
MCP 서버를 목(mock) 처리하지 않았으므로, 실제 서버 실행과 도구 사용을 명시적으로 허용해야 합니다.

```bash
claude plugin eval . \
  --ablation none \
  --allow-real-servers \
  --allow-tools "mcp__plugin_book-plugin_book-api__recommendBySubject" \
  --trust-plugin \
  --no-publish
```

`--trust-plugin`은 자신이 작성한 플러그인에 한해 최초 실행 확인 프롬프트를 건너뛸 때 씁니다.
새 케이스를 추가하려면 `claude plugin eval init <이름> --bare`로 템플릿을 생성합니다.
