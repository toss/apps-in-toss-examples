# In App Purchase Example

![Image](https://github.com/user-attachments/assets/e3e87c6f-75f1-4ad8-9c0f-1a4a13666f9f)
![Image](https://github.com/user-attachments/assets/de8efa61-1879-4916-8373-3537e63312fe)
![Image](https://github.com/user-attachments/assets/62eb3e4d-a6e1-493e-b76e-69bad926c2d8)
![Image](https://github.com/user-attachments/assets/5af3b63b-bda7-4ddb-9ae9-8c90fe747baf)

이 예제는 `getProductItemList`를 사용해 콘솔에 등록한 인앱 결제 상품 목록을 불러오고,  
사용자가 선택한 상품에 대해 `createOneTimePurchaseOrder`를 통해 결제를 진행하는 예제에요.

⚠️ 샌드박스 앱에서는 결제가 가상으로 진행돼요. 반면, 토스 앱에서 테스트할 경우 실제 결제가 발생하고, 결제된 금액은 [iOS](https://support.apple.com/ko-kr/118223) 또는 [Android](https://support.google.com/googleplay/answer/2479637?hl=ko)의 환불 정책에 따라 환불을 요청할 수 있어요.

// 이미지 자리

<br />

## 🚀 설치 및 실행 방법

1. **ZIP 파일**을 다운로드하고 압축을 풀어주세요.

2. `.yarnrc.yml` 파일의 `npmAuthToken` 항목에, [toss-design-system 그룹](https://tossmini-docs.toss.im/tds-react-native/setup-npm/)에 초대된 npm 계정의 토큰 값을 입력해주세요.

3. 필요한 패키지를 설치해요.

   ```
   yarn install
   ```

4. 개발 서버를 실행해요.

   ```
   yarn dev
   ```

<br />

## 📌 참고사항

- [인앱결제 연동하기](https://developers-apps-in-toss.toss.im/development/iap.html)
