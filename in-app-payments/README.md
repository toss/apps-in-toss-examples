# 인앱 결제 예제

앱인토스 WebView에서 일회성 인앱 결제를 연동하는 예제예요. 앱인토스 개발자센터의 [인앱 결제 문서](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iap/in-app-purchase)를 기준으로 상품 목록 조회, 결제 요청, 지급 실패 복원, 완료/환불 주문 조회, 서버 주문 상태 조회 payload를 한 화면에서 확인할 수 있게 만들었어요.

포함된 기능:

- 상품 목록 조회: `IAP.getProductItemList`로 콘솔에 등록된 인앱 상품을 가져와요.
- 일회성 결제: `IAP.createOneTimePurchaseOrder`로 결제창을 열고 결제 성공 이벤트를 받아요.
- 상품 지급 처리: `processProductGrant`에서 `orderId` 기준으로 상품 지급 성공 여부를 반환해요.
- 미결 주문 복원: `IAP.getPendingOrders`로 결제 완료 후 지급이 끝나지 않은 주문을 조회해요.
- 지급 완료 확정: `IAP.completeProductGrant`로 미결 주문의 지급 완료를 확정해요.
- 완료/환불 주문 조회: `IAP.getCompletedOrRefundedOrders`로 구매 완료와 환불 주문을 조회해요.
- 서버 상태 조회 예시: `/api-partner/v1/apps-in-toss/order/get-order-status` 요청 payload를 만들어요.

## 시작하기

```bash
npm install
npm run dev
```

일반 브라우저에서는 인앱 결제 API가 동작하지 않을 수 있어요. 샌드박스 앱이나 토스앱 테스트 환경에서 확인해 주세요.

## 테스트하기

```bash
npm run test
```

테스트는 Node.js 내장 테스트 러너로 실행하고, SDK를 직접 호출하지 않고 `src/payments/safety.ts`의 결제 안전장치만 검증해요.

## 인앱 상품 등록하기

상품 목록이 비어 있다면 앱인토스 콘솔에서 먼저 인앱 상품을 등록해야 해요.

1. [앱인토스 콘솔](https://apps-in-toss.toss.im/)에서 미니앱을 선택해요.
2. 인앱 결제 메뉴에서 상품을 등록해요.
3. 상품의 `sku`, 표시 이름, 설명, 금액, 아이콘을 확인해요.
4. 상품의 노출 상태를 ON으로 바꿔요.
5. 샌드박스 앱에서 예제를 다시 실행해 상품 목록이 표시되는지 확인해요.

콘솔 MCP 서버를 사용 중이라면 에이전트에게 "이 미니앱에 테스트용 인앱 상품을 등록해줘"라고 요청해도 돼요. 콘솔 MCP가 연결되어 있지 않다면 먼저 MCP 서버 연결을 요청한 뒤 상품 등록을 진행해 주세요.

## 코드 구조

- `src/App.tsx`: 상품, 복원, 내역, 체크리스트 탭을 제공하는 예제 화면이에요.
- `src/hooks/useInAppPayments.ts`: 상품 조회, 결제 요청, 미결 주문 복원, 완료/환불 주문 조회를 담당해요.
- `src/payments/safety.ts`: 상품 지급 완료 여부와 서버 주문 상태 조회 payload를 만드는 순수 함수예요.
- `src/payments/safety.test.ts`: 결제 안전장치와 필수 테스트 체크리스트를 검증해요.

## 반드시 테스트해야 하는 시나리오

- 상품 목록 조회: 콘솔에 등록하고 노출 ON인 상품만 표시되는지 확인해요.
- 결제 성공: `success` 이벤트의 `orderId`, 상품명, 금액을 기록하고 UI에 반영해요.
- 결제 성공 + 상품 지급 실패: `processProductGrant`가 `false`를 반환하는 상황을 테스트해요.
- 미결 주문 복원: 앱 재진입 시 `getPendingOrders`로 주문을 찾고, 상품 지급 후 `completeProductGrant`를 호출해요.
- 결제 오류/취소: 사용자가 결제를 취소하거나 네트워크 오류가 발생했을 때 재시도 가능한 UI를 제공해요.
- 완료/환불 주문 조회: 구매 완료와 환불 상태가 서비스 이용권, 아이템, 결제 내역에 반영되는지 확인해요.

## 구현 시 주의사항

- `processProductGrant`는 결제 성공 후 상품을 실제로 지급하는 중요한 콜백이에요. 30초 안에 지급 성공 여부를 반환해야 해요.
- 상품 지급은 반드시 파트너 서버에서 `orderId` 기준으로 멱등하게 처리해 주세요. 같은 주문이 두 번 들어와도 중복 지급되면 안 돼요.
- 클라이언트 로컬 상태만으로 지급 완료를 확정하지 마세요. 이 예제의 `localStorage` 기록은 샘플용 중복 방어 장치일 뿐이에요.
- `processProductGrant`가 `false`를 반환하거나 중간에 실패하면, 결제 완료 주문이 미결 상태로 남을 수 있어요. 앱 시작 시 `getPendingOrders` 복원 흐름을 반드시 연동해 주세요.
- `completeProductGrant`는 상품 지급이 성공한 뒤 호출해야 해요. 지급 전에 완료 처리하면 사용자가 상품을 받지 못했는데 주문만 완료될 수 있어요.
- 토스 앱 로그인 기기를 바꿔도 기존 결제 상품이 유지되어야 해요. 토스 로그인, 파트너 서버 저장소, 주문 상태 조회 API를 함께 사용해 주세요.
- 주문 상태 조회 API는 파트너 서버에서 mTLS 인증서로 호출해야 해요. 미니앱 클라이언트에서 직접 호출하지 마세요.

## 배포하기

앱인토스 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키 > 콘솔 API 키에서 발급받을 수 있어요.

```bash
npm run build
npm run deploy
```

## 관련 개발자센터 문서

- [인앱 결제](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iap/in-app-purchase)
- [인앱 결제 소개](https://developers-apps-in-toss.toss.im/guide/monetization/in-app-payment)
- [인앱 결제 API](https://developers-apps-in-toss.toss.im/documentation/api/iap)
- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)

AI를 사용하시는 경우 [LLMs 문서](https://developers-apps-in-toss.toss.im/development/llms.html)를 함께 확인해 보세요.
