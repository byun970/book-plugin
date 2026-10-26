---
name: book-recommender
description: book-plugin의 book-api MCP 도구로 책을 검색하거나 장르별로 추천한다. "책 추천해줘", "SF 소설 찾아줘", "이 작가 책 검색해줘" 같은 요청에 사용한다.
---

# 책 검색 · 추천

book-plugin의 book-api MCP 서버가 제공하는 도구(`searchBooks`, `getWorkDetails`, `recommendBySubject`)로 책을 찾고 정리한다.

## 절차
1. 사용자가 제목·저자·키워드를 말하면 `searchBooks`를 쓴다. 장르(SF, 추리, 로맨스 등)로만 요청하면 `recommendBySubject`를 쓴다.
2. 특정 책의 줄거리나 세부 정보를 원하면, 검색 결과의 `key`(예: `/works/OL893414W`)에서 `/works/` 다음 부분만 `olid`로 넘겨 `getWorkDetails`를 호출한다.
3. 다음 형식의 마크다운 표로 응답한다: `제목 | 저자 | 출간연도`.
4. 도구 호출 결과에 없는 책이나 설명을 지어내지 않는다.
