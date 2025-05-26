# Operational Environment Example

![Image](https://github.com/user-attachments/assets/e3e87c6f-75f1-4ad8-9c0f-1a4a13666f9f)
![Image](https://github.com/user-attachments/assets/de8efa61-1879-4916-8373-3537e63312fe)
![Image](https://github.com/user-attachments/assets/62eb3e4d-a6e1-493e-b76e-69bad926c2d8)
![Image](https://github.com/user-attachments/assets/5af3b63b-bda7-4ddb-9ae9-8c90fe747baf)

`getOperationalEnvironment`을 사용해서 앱의 운영 환경에 따라 디버그 정보를 보여주는 예제에요.  
Sandbox 환경에서는 실행 환경, 네트워크 상태, 사용자 언어, 스킴 URI, 운영체제(OS), 디바이스 ID 등의 정보를 확인할 수 있고,  
Toss 앱에서는 디버그 정보를 표시하지 않도록 처리돼 있어요.

<img src="../assets/with-operational-environment-example-image.png" alt="with-operational-environment-example-image" style="width: 670px;" />

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

[Bedrock/react-native/reference/framework/환경 확인/getOperationalEnvironment](https://tossmini-docs.toss.im/react-native/reference/framework/%ED%99%98%EA%B2%BD%20%ED%99%95%EC%9D%B8/getOperationalEnvironment.html)
