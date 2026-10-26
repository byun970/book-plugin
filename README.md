# wori-sample-marketplace

Claude Code 커스텀 플러그인 실습 자료. `sample-toolkit` 플러그인 하나를 담은 마켓플레이스 저장소입니다.

```
261026_16_plugin/
├── .claude-plugin/
│   └── marketplace.json          # 마켓플레이스 정의
└── plugins/
    └── sample-toolkit/
        ├── .claude-plugin/plugin.json
        ├── mcp-server/            # 1) OpenAPI 활용 + 2) MCP 서버
        │   ├── openapi.json
        │   ├── server.js
        │   └── package.json
        ├── skills/todo-briefing/  # 3) Skill
        ├── agents/api-reviewer.md # 3) Agent
        ├── hooks/                 # 3) Hook
        │   ├── hooks.json
        │   └── log-call.js
        └── .mcp.json
```

## 1~3단계: OpenAPI · MCP · Skill/Hook/Agent

`plugins/sample-toolkit/README.md`에 각 구성요소 설명이 있습니다.

## 4단계: 깃허브 배포

이 저장소는 이미 다음 주소에 배포되어 있습니다: https://github.com/byun970/wori-sample-plugin

다른 세션(또는 다른 사용자)은 아래 명령으로 설치할 수 있습니다.

```bash
claude plugin marketplace add byun970/wori-sample-plugin
claude plugin install sample-toolkit@wori-sample-marketplace
```

세션 안에서는 다음과 같이 설치합니다.

```
/plugin install sample-toolkit --marketplace byun970/wori-sample-plugin
```

설치 후 플러그인을 업데이트할 때는 다음 순서로 진행합니다.

```bash
claude plugin marketplace update wori-sample-marketplace
claude plugin update sample-toolkit@wori-sample-marketplace
```

업데이트는 다음 세션부터 적용됩니다.

## 5단계: 플러그인 테스트

```bash
# 플러그인 매니페스트/경로/MCP 항목 검증
claude plugin validate ./plugins/sample-toolkit --strict

# 마켓플레이스 정의 검증
claude plugin validate .

# 설치 없이 세션에 바로 로드해서 수동 확인
claude --plugin-dir ./plugins/sample-toolkit
```

```bash
# 평가(eval) 실행 — 실제 MCP 서버와 도구 사용을 허용
cd plugins/sample-toolkit
claude plugin eval . --ablation none --allow-real-servers \
  --allow-tools "mcp__plugin_sample-toolkit_todo-api__listTodos" \
  --trust-plugin --no-publish
```

위 명령은 실제로 실행해 3회 반복 모두 통과(score 1.00)하는 것을 확인했습니다. 자세한 옵션은 `plugins/sample-toolkit/README.md`의 "평가(eval)" 절을 참고하세요.
