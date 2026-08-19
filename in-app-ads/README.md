# 인앱 광고 예제

앱인토스 WebView에서 전면형, 보상형, 배너 광고를 연동하는 예제예요. 앱인토스 개발자센터의 [인앱 광고 문서](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa)를 기준으로 만들었고, 개발 단계에서 사용할 수 있는 테스트 광고 ID를 기본값으로 넣었어요.

포함된 기능:

- 전면형 광고: `loadFullScreenAd`로 미리 로드하고 `showFullScreenAd`로 사용자 선택 시점에 표시해요.
- 보상형 광고: `userEarnedReward` 이벤트에서만 리워드 지급 대상으로 처리해요.
- 배너 광고: `TossAds.initialize`를 앱에서 한 번만 호출하고, 빈 DOM 슬롯에 `TossAds.attachBanner`로 부착해요.
- 광고 정책 테스트: 클릭 보상, SDK 이벤트 우회, 자동 refresh, CTA 주변 배치 같은 어뷰징 가능 패턴을 테스트로 차단해요.

## 시작하기

```bash
npm install
npm run dev
```

개발 서버가 실행되면 앱인토스 콘솔의 QR 테스트 환경에서 확인해 주세요. 인앱 광고는 샌드박스 앱에서 지원되지 않으므로, 일반 브라우저나 샌드박스 앱에서는 `isSupported()`가 false이거나 광고가 표시되지 않을 수 있어요.

## 테스트하기

```bash
npm run test
```

테스트는 Node.js 내장 테스트 러너로 실행하고, 광고 SDK를 직접 호출하지 않고 `src/ads/policy.ts`의 정책 검증 로직만 확인해요. 실제 광고 노출 테스트는 반드시 테스트 광고 ID로 진행해야 해요.

| 유형                 | 테스트 ID                     |
| -------------------- | ----------------------------- |
| 전면형 광고          | `ait-ad-test-interstitial-id` |
| 보상형 광고          | `ait-ad-test-rewarded-id`     |
| 배너 광고 - 리스트형 | `ait-ad-test-banner-id`       |
| 배너 광고 - 피드형   | `ait-ad-test-native-image-id` |

## 광고 신청 및 광고 그룹 ID 설정

실제 광고를 노출하려면 먼저 앱인토스 콘솔에서 인앱 광고를 신청하고 광고 그룹 ID를 발급받아야 해요.

1. [앱인토스 콘솔](https://apps-in-toss.toss.im/)에서 미니앱을 선택해요.
2. 인앱 광고 메뉴에서 광고 사용을 신청해요.
3. 전면형, 보상형, 배너 광고 그룹을 만들고 광고 그룹 ID를 발급받아요.
4. `src/ads/policy.ts`의 `TEST_AD_GROUP_IDS` 값을 실제 광고 그룹 ID로 교체해요.

콘솔 MCP 서버를 사용 중이라면 에이전트에게 "이 미니앱에 인앱 광고를 신청하고 전면형/보상형/배너 광고 그룹을 만들어줘"라고 요청해도 돼요. 콘솔 MCP가 연결되어 있지 않다면 먼저 MCP 서버 연결을 요청한 뒤 광고 신청과 광고 그룹 생성을 진행해 주세요.

## 코드 구조

- `src/App.tsx`: 전면형, 보상형, 배너, 정책 체크 탭을 제공하는 예제 화면이에요.
- `src/hooks/useFullScreenAd.ts`: 전면형/보상형 광고의 `load → show → 다음 load` 순서를 관리해요.
- `src/hooks/useTossBanner.ts`: 배너 SDK를 한 번만 초기화하고 배너 슬롯을 부착해요.
- `src/ads/policy.ts`: 광고 정책 위반 가능성이 높은 배치 조건을 순수 함수로 검증해요.
- `src/ads/policy.test.ts`: 어뷰징 가능 패턴이 차단되는지 확인하는 테스트예요.

## 반드시 지켜야 하는 광고 정책

광고 정책을 위반하면 광고 노출 제한, 정산 보류, 서비스 이용 제한이 발생할 수 있어요. 테스트 중에도 실제 광고 ID로 반복 호출하거나 클릭을 유도하면 불이익을 받을 수 있으니 개발 단계에서는 반드시 테스트 광고 ID를 사용해 주세요.

- 광고를 콘텐츠, 추천 서비스, 금융 팁처럼 위장하지 마세요. SDK가 제공하는 `Ad` 표기와 광고 UI를 유지해야 해요.
- 결제, 인증, 계좌 개설, 주문 완료처럼 사용자의 핵심 목표가 진행 중인 화면에는 광고를 넣지 마세요.
- CTA, 닫기 버튼, 게임 조작 영역, 입력 필드 바로 옆에 광고를 배치하지 마세요. 의도치 않은 클릭을 유도하는 구조로 볼 수 있어요.
- 동일 화면에 같은 포맷 광고를 2개 이상 배치하지 마세요.
- 광고 클릭을 보상 조건으로 삼지 마세요. 보상형 광고의 리워드는 `userEarnedReward` 이벤트에서만 지급해야 해요.
- SDK의 Click, Impression, Viewable 이벤트를 직접 만들거나 우회하지 마세요.
- 광고 영역을 타이머로 주기적 refresh하지 마세요. SDK가 제공하는 자동 갱신 흐름만 사용해요.
- 전면형/보상형 광고는 사용자가 예측할 수 있는 시점에만 보여 주세요. 앱 진입 직후, 뒤로 가기 차단, 막다른 화면에서 강제 노출하는 패턴은 피해야 해요.

## 올바른 노출 위치 예시

- 전면형 광고: 콘텐츠를 끝까지 본 뒤 다음 콘텐츠로 넘어가기 전, 사용자가 "다음 콘텐츠 전에 광고 보기"를 선택한 시점
- 보상형 광고: 사용자가 "광고 보고 보상 받기"를 직접 선택한 시점
- 배너 광고: 목록 중간의 독립된 광고 슬롯, 콘텐츠와 CTA를 가리지 않는 위치

## 배포하기

앱인토스 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키 > 콘솔 API 키에서 발급받을 수 있어요.

```bash
npm run build
npm run deploy
```

## 관련 개발자센터 문서

- [인앱 광고](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa)
- [전면형/보상형 광고](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/interstitial-rewarded-ad)
- [배너 광고(WebView)](https://developers-apps-in-toss.toss.im/documentation/common/monetization/iaa/web-banner)
- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)

AI를 사용하시는 경우 [LLMs 문서](https://developers-apps-in-toss.toss.im/development/llms.html)를 함께 확인해 보세요.
