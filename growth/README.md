# 유입 & 성장 기능 예제

앱인토스 개발자센터의 유입 & 성장 기능을 한 번에 확인할 수 있는 WebView 예제예요.

포함된 기능:

- 프로모션: `grantPromotionReward`로 비게임 미니앱에서 토스 포인트 프로모션을 지급해요.
- 리뷰 요청: `requestReview`로 사용자가 만족감을 느끼는 시점에 리뷰 작성을 요청해요.
- 스마트 발송: `requestNotificationAgreement`로 알림 동의문을 요청하고, 서버 API 예제로 메시지 발송 payload를 확인해요.
- 공유 리워드: `contactsViral`로 친구 공유 플로우를 실행하고 리워드 이벤트를 처리해요.
- 공유: `getTossShareLink`와 `share`로 토스앱 딥링크 공유 링크를 만들고 네이티브 공유 시트를 열어요.
- 분석: `Analytics.screen`, `Analytics.click`으로 referrer를 포함한 분석 이벤트를 기록해요.

## 시작하기

```bash
npm install
npm run dev
```

## 배포하기

앱인토스 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키 > 콘솔 API 키에서 발급받을 수 있어요.

```bash
npm run build
npm run deploy
```

## 코드 구조

- `src/App.tsx`: 미니앱 클라이언트에서 직접 호출할 수 있는 SDK 기능 예제예요.
- `src/serverGrowthExamples.ts`: 파트너사 서버에서 호출해야 하는 스마트 발송, 서버형 프로모션 API 예제예요.

## 설정값 바꾸기

예제 화면에는 테스트용 기본값이 들어 있어요. 실제 테스트 전 아래 값을 콘솔에서 발급한 값으로 바꿔 주세요.

| 기능 | 화면 입력값 | 확인 위치 |
| --- | --- | --- |
| 프로모션 | `promotionCode` | 앱인토스 콘솔 > 미니앱 > 프로모션 |
| 스마트 발송 | `templateCode` | 앱인토스 콘솔 > 미니앱 > 스마트 발송 > 기능성 |
| 공유 리워드 | `moduleId` | 앱인토스 콘솔 > 미니앱 > 공유 리워드 |
| 공유 | `deepLink`, `ogImageUrl` | 출시 후 `intoss://...`, 출시 전 QR 코드의 테스트 스킴 |

## 구현 시 주의사항

- 프로모션 지급 함수는 중복 호출되면 동일 사용자에게 리워드가 중복 지급될 수 있어요. 실제 서비스에서는 주문 ID, 미션 ID, 사용자 ID 같은 멱등 키로 중복 지급을 막아 주세요.
- `requestReview`는 호출해도 항상 리뷰 UI가 표시되지는 않아요. 리뷰 작성 여부를 기준으로 보상을 지급하거나 다음 화면으로 이동하면 안 돼요.
- 스마트 발송 메시지 발송 API는 mTLS 인증서가 필요한 서버 간 통신이에요. 미니앱 클라이언트에서 직접 호출하지 말고 파트너사 서버에서 호출해 주세요.
- `contactsViral`과 `requestNotificationAgreement`는 cleanup 함수를 반환해요. 이벤트를 받은 뒤 반드시 cleanup을 호출해 이벤트 리스너를 해제해 주세요.
- `getTossShareLink`에 전달하는 경로는 `intoss://`로 시작해야 해요. 출시 전 테스트는 QR 코드에 포함된 `intoss-private://` 스킴을 사용해 주세요.
- 분석 이벤트는 샌드박스나 QR 테스트 환경에서는 수집되지 않을 수 있어요. 콘솔 데이터는 라이브 환경에서 런칭 다음 날부터 확인하는 흐름을 기준으로 봐 주세요.

## 관련 개발자센터 문서

- [프로모션](https://developers-apps-in-toss.toss.im/documentation/common/growth/promotion)
- [리뷰 요청](https://developers-apps-in-toss.toss.im/documentation/common/growth/review)
- [스마트 발송](https://developers-apps-in-toss.toss.im/documentation/common/growth/smart-message)
- [공유 리워드](https://developers-apps-in-toss.toss.im/documentation/common/growth/share/reward)
- [미니앱 공유 링크](https://developers-apps-in-toss.toss.im/documentation/common/growth/share/miniapp-share-link)
- [메시지 공유](https://developers-apps-in-toss.toss.im/documentation/common/growth/share/share-message)
- [사용자 행동 기록](https://developers-apps-in-toss.toss.im/documentation/common/growth/analytics/user-behavior)
- [유입경로 레퍼러](https://developers-apps-in-toss.toss.im/documentation/common/growth/analytics/referrer)

AI를 사용하시는 경우 [LLMs 문서](https://developers-apps-in-toss.toss.im/development/llms.html)를 함께 확인해 보세요.
