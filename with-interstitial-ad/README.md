# Interstitial Ad Example

![Image](https://github.com/user-attachments/assets/e3e87c6f-75f1-4ad8-9c0f-1a4a13666f9f)
![Image](https://github.com/user-attachments/assets/62eb3e4d-a6e1-493e-b76e-69bad926c2d8)

`loadAdMobInterstitialAd`를 사용해 전면 광고를 로드하고, `showAdMobInterstitialAd`로 광고를 노출하는 예제예요.  
[Google AdMob](https://support.google.com/admob/answer/6066980?hl=ko)에서는 사용자 경험 측면에서 전면 광고를 화면 이동 전에 먼저 보여주는 방식을 권장하고 있어요.  
⚠️ 이 예제는 토스 앱 환경에서만 확인할 수 있어요.

![with-interstitial-ad-example-image](../assets/with-interstitial-ad-example-image.png)

<br />

## 🚀 설치 및 실행 방법

1. **ZIP 파일**을 다운로드하고 압축을 풀어주세요.

2. `.yarnrc.yml` 파일의 `npmAuthToken` 항목에, [toss-design-system 그룹](https://tossmini-docs.toss.im/tds-react-native/setup-npm/)에 초대된 npm 계정의 토큰 값을 입력해주세요.

3. 필요한 패키지를 설치해요.

   ```
   yarn install
   ```

4. `src/hooks/useInterstitialAd.ts`에 **Ad Unit ID**를 입력해요.

   ```ts
   const AD_UNIT_ID = '<YOUR_AD_UNIT_ID>';
   ```

5. 번들 파일을 생성해요.

   ```
   yarn build
   ```

6. 앱인토스 콘솔에 [앱 번들 업로드](https://developers-apps-in-toss.toss.im/release/overview.html#_1-%E1%84%8B%E1%85%A2%E1%86%B8-%E1%84%87%E1%85%A5%E1%86%AB%E1%84%83%E1%85%B3%E1%86%AF-%E1%84%8B%E1%85%A5%E1%86%B8%E1%84%85%E1%85%A9%E1%84%83%E1%85%B3)를 하고 테스트해요.

<br />

## 📌 참고사항

- [loadAdMobInterstitialAd](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/loadAdMobInterstitialAd.html)
- [showAdMobInterstitialAd](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EA%B4%91%EA%B3%A0/showAdMobInterstitialAd.html)
