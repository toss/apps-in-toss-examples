# Non-Game User Identification

비게임 미니앱에서 `getAnonymousKey`로 사용자 식별키를 가져오는 예제예요.

이 예제는 앱인토스 개발자센터의 [사용자 식별키 발급](https://developers-apps-in-toss.toss.im/user-hash-key/develop.html) 문서 중 비게임 미니앱 섹션을 참고해 만들었어요.

## 실행 화면

<img src="./assets/non-game-user-identification-screenshot.png" alt="비게임 사용자 식별키 예제 실행 화면" width="360" />

## 꼭 확인하세요

- 이 예제는 비게임 카테고리 미니앱에서 사용해야 해요.
- 게임 카테고리 미니앱에서 호출하면 `'INVALID_CATEGORY'`가 반환돼요.
- `@apps-in-toss/web-framework` 3.x에서 지원돼요.
- 반환되는 `hash`는 토스 서버 API 호출용 키가 아니라 미니앱 내부 사용자 식별용 키예요.

## 설치

```bash
npm install
```

## 실행

```bash
npm run dev
```

## 빌드와 배포

```bash
npm run build
npm run deploy
```

## 구현 흐름

1. `getAnonymousKey()`를 호출해요.
2. 응답이 `undefined`이면 지원하지 않는 SDK 버전으로 안내해요.
3. 응답이 `'INVALID_CATEGORY'`이면 비게임 카테고리 미니앱이 아니라고 안내해요.
4. 응답이 `'ERROR'`이면 오류 상태를 안내해요.
5. `{ type: 'HASH', hash }`가 반환되면 `hash`를 미니앱 내부 사용자 식별키로 사용해요.
