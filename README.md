# wori-sample-marketplace

[![License](https://img.shields.io/github/license/byun970/book-plugin)](LICENSE)
[![Claude Code Plugin](https://img.shields.io/badge/Claude%20Code-Install%20Plugin-5A32FB)](#4단계-깃허브-배포)
[![Last Commit](https://img.shields.io/github/last-commit/byun970/book-plugin)](https://github.com/byun970/book-plugin/commits/main)

Claude Code 커스텀 플러그인 실습 자료. `book-plugin` 플러그인 하나를 담은 마켓플레이스 저장소입니다. Open Library 공개 API(키 불필요)로 책을 검색·추천합니다.

**저장소**: https://github.com/byun970/book-plugin

```
261026_16_plugin/
├── .claude-plugin/
│   └── marketplace.json          # 마켓플레이스 정의
└── plugins/
    └── book-plugin/
        ├── .claude-plugin/plugin.json
        ├── mcp-server/                 # 1) OpenAPI 활용 + 2) MCP 서버
        │   ├── openapi.json
        │   ├── server.js
        │   └── package.json
        ├── skills/book-recommender/    # 3) Skill
        ├── agents/api-reviewer.md      # 3) Agent
        ├── hooks/                      # 3) Hook
        │   ├── hooks.json
        │   └── log-call.js
        ├── evals/book-recommender-basic/  # 5) 평가(eval)
        └── .mcp.json
```

## 1~3단계: OpenAPI · MCP · Skill/Hook/Agent

`plugins/book-plugin/README.md`에 각 구성요소 설명이 있습니다.

## 4단계: 깃허브 배포

이 저장소는 이미 다음 주소에 배포되어 있습니다: https://github.com/byun970/book-plugin

다른 세션(또는 다른 사용자)은 아래 명령으로 설치할 수 있습니다.

```bash
claude plugin marketplace add byun970/book-plugin
claude plugin install book-plugin@wori-sample-marketplace
```

세션 안에서는 다음과 같이 설치합니다.

```
/plugin install book-plugin --marketplace byun970/book-plugin
```

설치 후 플러그인을 업데이트할 때는 다음 순서로 진행합니다.

```bash
claude plugin marketplace update wori-sample-marketplace
claude plugin update book-plugin@wori-sample-marketplace
```

업데이트는 다음 세션부터 적용됩니다.

## 5단계: 플러그인 테스트

```bash
# 플러그인 매니페스트/경로/MCP 항목 검증
claude plugin validate ./plugins/book-plugin --strict

# 마켓플레이스 정의 검증
claude plugin validate .

# 설치 없이 세션에 바로 로드해서 수동 확인
claude --plugin-dir ./plugins/book-plugin
```

```bash
# 평가(eval) 실행 — 실제 MCP 서버와 도구 사용을 허용
cd plugins/book-plugin
claude plugin eval . --ablation none --allow-real-servers \
  --allow-tools "mcp__plugin_book-plugin_book-api__recommendBySubject" \
  --trust-plugin --no-publish
```

위 명령은 실제로 실행해 3회 반복 모두 통과(score 1.00)하는 것을 확인했습니다. 자세한 옵션은 `plugins/book-plugin/README.md`의 "평가(eval)" 절을 참고하세요.

## 업데이트 이력

| 버전 | 커밋 | 내용 |
| :- | :- | :- |
| 0.1.0 | `6883850` | 초기 커밋. Todo API 기반 OpenAPI·MCP 서버·Skill·Hook·Agent·마켓플레이스 구조 |
| 0.1.1 | `5269b43` | MCP 서버의 외부 npm 의존성 제거 (새로 설치한 환경에서도 바로 동작하도록) |
| 0.1.2 | `50b6e75` | 입력값 검증과 HTTP 오류 처리 추가 |
| - | `e8b5b41` | 설치 안내 문서 정리, 불필요한 gitignore 항목 제거 |
| - | `c60f67d` | `claude plugin eval` 구조 추가 |
| - | `f5a0827` | 플러그인 아이콘 추가 |
| 0.2.0 | `6bd80ba` | 주제를 Todo API에서 Open Library 책 검색·추천으로 전면 교체 |
| 0.2.1 | `7897c7f` | api-reviewer 검토 반영 — 응답 스펙, 구조화된 오류, 파라미터 화이트리스트 검증 추가 |
| 0.3.0 | `9b41379` | 플러그인 이름을 sample-toolkit에서 book-plugin으로 변경 |
| 0.3.1 | `7d744fb` | 입력값 검증 실패 응답도 ErrorResponse 스키마로 통일 |
| - | `200131f` | GitHub 저장소 이름을 book-plugin으로 변경, 설치 안내 URL 갱신 |
| - | `ee1c216` | eval 채점 기준의 모호함 제거 (업스트림 장르 태깅 정확성은 검증 대상 아님을 명시) |
