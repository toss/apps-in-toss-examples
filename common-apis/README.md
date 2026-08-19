# 공통 API 예제

앱인토스 WebView에서 파일, 저장소, 네트워크, 실행 환경 API를 호출하는 예제예요. 앱인토스 개발자센터의 [파일 & 저장소 문서](https://developers-apps-in-toss.toss.im/documentation/common/file-storage)와 [네트워크 & 환경 문서](https://developers-apps-in-toss.toss.im/documentation/common/network-environment)를 기준으로 실제 호출 버튼과 결과 확인 영역을 구성했어요.

포함된 기능:

- 파일 저장: `File.saveBase64`로 앱에서 만든 Base64 데이터를 기기에 저장해요.
- PDF 뷰어: `File.openPDFViewer`로 Base64 PDF 데이터를 네이티브 PDF 뷰어에서 열어요.
- 로컬 저장소 저장: `Storage.setItem`으로 문자열 값을 저장해요.
- 로컬 저장소 조회: `Storage.getItem`으로 저장된 값을 가져오고, 값이 없으면 `null`을 확인해요.
- 로컬 저장소 삭제: `Storage.removeItem`으로 특정 키를 삭제해요.
- 로컬 저장소 전체 삭제: `Storage.clearItems`로 현재 미니앱 Storage 값을 모두 삭제해요.
- 실행 환경 조회: `Environment.deviceId`, `Environment.groupId`, `Environment.environment`, `Environment.tossAppVersion`, `Environment.deploymentId`, `Environment.initialURL` 값을 확인해요.
- 네트워크 상태 조회: `Environment.getNetworkStatus`로 현재 연결 상태를 확인해요.
- 서버 시간 조회: `Environment.getServerTime`으로 토스 앱 서버 시간을 가져와요.

## 시작하기

```bash
npm install
npm run dev
```

일반 브라우저에서는 앱인토스 WebView 호스트가 없어서 일부 API 호출이 실패할 수 있어요. 샌드박스 앱이나 토스앱 테스트 환경에서 확인해 주세요.

## 코드 구조

- `src/App.tsx`: 공통 API를 호출하는 버튼, 입력값, 결과 표시 UI를 제공해요.
- `src/App.css`: 모바일 WebView 기준의 단일 화면 스타일을 정의해요.
- `apps-in-toss.config.ts`: Apps in Toss WebView 앱 이름, 브랜드 색상, 빌드 디렉터리를 설정해요.

`src/App.tsx`에는 MCP나 LLM이 구현 의도를 읽기 쉽도록 각 API 핸들러 위에 주석을 남겨두었어요. 실제 서비스에 옮길 때는 주석의 주의사항을 함께 확인해 주세요.

## 파일 API 구현 참고

`File.saveBase64`는 Base64 문자열, 파일 이름, MIME 타입을 받아 기기에 파일 저장을 요청해요.

```ts
await File.saveBase64({
  data: base64Data,
  fileName: "apps-in-toss-common-apis.txt",
  mimeType: "text/plain",
});
```

주의할 점:

- `fileName`에는 확장자를 포함해야 해요.
- 텍스트를 Base64로 바꿀 때는 UTF-8 인코딩을 고려해야 해요.
- 실제 저장 동작은 토스 앱이나 샌드박스 앱 WebView에서 확인해 주세요.
- 지원 여부가 필요한 API는 `File.saveBase64.isSupported()`로 확인할 수 있어요.

`File.openPDFViewer`는 Base64 PDF 데이터를 네이티브 PDF 뷰어로 열어요.

```ts
const result = await File.openPDFViewer({
  data: pdfBase64Data,
  filename: "apps-in-toss-common-apis.pdf",
});
```

주의할 점:

- 반환값은 뷰어가 닫힌 뒤 resolve돼요.
- 현재 SDK 기준 반환값은 `"CLOSE"`예요.
- 지원 여부는 `File.openPDFViewer.isSupported()`로 확인할 수 있어요.

## Storage API 구현 참고

`Storage`는 문자열 기반 로컬 저장소예요.

```ts
await Storage.setItem("apps-in-toss:common-apis:memo", "메모");
const value = await Storage.getItem("apps-in-toss:common-apis:memo");
await Storage.removeItem("apps-in-toss:common-apis:memo");
await Storage.clearItems();
```

주의할 점:

- 저장 값은 문자열이에요. 객체는 `JSON.stringify`로 저장하고 `JSON.parse`로 복원해 주세요.
- `getItem`은 값이 없으면 `null`을 반환해요.
- `clearItems`는 현재 미니앱 Storage 값을 모두 삭제하므로 로그아웃이나 테스트 초기화처럼 명확한 상황에서만 연결해 주세요.
- 결제 지급 여부, 서버 권한, 계정 상태처럼 중요한 데이터는 클라이언트 Storage만 믿지 말고 파트너 서버에 저장해 주세요.

## Environment API 구현 참고

`Environment`는 WebView 실행 환경과 네트워크 상태를 확인할 때 사용해요.

```ts
const environment = Environment.environment;
const deploymentId = Environment.deploymentId;
const networkStatus = await Environment.getNetworkStatus();
const serverTime = await Environment.getServerTime();
```

주의할 점:

- `deviceId`, `groupId`, `environment`, `tossAppVersion`, `deploymentId`, `initialURL`은 동기 getter예요.
- `getNetworkStatus`는 `OFFLINE`, `WIFI`, `2G`, `3G`, `4G`, `5G`, `WWAN`, `UNKNOWN` 중 하나를 반환해요.
- `getServerTime`은 디바이스 시간이 아니라 토스 앱 서버 시간을 Unix timestamp(ms)로 반환해요.
- 서버 시간은 출석 체크, 쿠폰 만료, 이벤트 종료처럼 사용자 기기 시간 조작에 영향을 받으면 안 되는 기능에 사용하기 좋아요.

## 반드시 테스트해야 하는 시나리오

- 파일 저장: 샌드박스 앱에서 텍스트 파일 저장 버튼을 누른 뒤 파일 저장 UI가 열리는지 확인해요.
- PDF 뷰어: PDF 뷰어가 열리고 닫은 뒤 결과 영역에 반환값이 표시되는지 확인해요.
- Storage 저장/조회: 값을 저장한 뒤 같은 키로 조회했을 때 동일한 문자열이 표시되는지 확인해요.
- Storage 삭제: 특정 키 삭제 후 조회했을 때 `null`이 표시되는지 확인해요.
- Storage 전체 삭제: 여러 값을 저장한 앱에서 전체 삭제 동작이 의도한 범위만 지우는지 확인해요.
- 실행 환경 조회: 샌드박스 앱에서 `environment`, `deploymentId`, `initialURL` 값이 기대한 값으로 표시되는지 확인해요.
- 네트워크 상태 조회: Wi-Fi, 셀룰러, 오프라인 상태에서 반환값이 어떻게 바뀌는지 확인해요.
- 서버 시간 조회: 반환된 timestamp가 현재 서버 시간과 맞고, 기기 시간을 변경해도 영향을 받지 않는지 확인해요.
- 일반 브라우저 실행: 호스트 API 호출 실패 시 결과 영역에 오류 메시지가 표시되는지 확인해요.

## 배포하기

앱인토스 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키 > 콘솔 API 키에서 발급받을 수 있어요.

```bash
npm run build
npm run deploy
```

## 관련 개발자센터 문서

- [파일 & 저장소](https://developers-apps-in-toss.toss.im/documentation/common/file-storage)
- [네트워크 & 환경](https://developers-apps-in-toss.toss.im/documentation/common/network-environment)
- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)

AI를 사용하시는 경우 [LLMs 문서](https://developers-apps-in-toss.toss.im/development/llms.html)를 함께 확인해 보세요.
