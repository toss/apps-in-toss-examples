import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-native-bedrock/native/@react-navigation/native';
import { GoogleAdMob } from '@apps-in-toss/framework';

const AD_UNIT_ID = '<YOUR_AD_UNIT_ID>';

interface InterstitialAdCallback {
  onDismiss?: () => void;
}

export function useInterstitialAd() {
  const [loading, setLoading] = useState(true);
  const dismissCallbackRef = useRef<(() => void) | undefined>();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      const isAdUnsupported =
        GoogleAdMob.loadAdMobInterstitialAd.isSupported?.() === false;

      if (isAdUnsupported) {
        console.warn('광고가 준비되지 않았거나, 지원되지 않아요.');
        return;
      }

      const cleanup = GoogleAdMob.loadAdMobInterstitialAd({
        options: {
          adUnitId: AD_UNIT_ID,
        },
        onEvent: (event) => {
          switch (event.type) {
            case 'loaded':
              setLoading(false);
              break;

            case 'dismissed':
              dismissCallbackRef.current?.();
              dismissCallbackRef.current = undefined;

              break;

            case 'clicked':
              // 사용자가 광고를 클릭했어요.
              break;

            case 'failedToShow':
              // 광고를 보여주지 못했어요.
              break;

            case 'impression':
              // 광고가 화면에 노출됐어요.
              break;

            case 'show':
              // 광고 컨텐츠가 노출되기 시작했어요.
              break;
          }
        },
        onError: (error) => {
          console.error('광고 로드 실패', error);
        },
      });

      return cleanup;
    }, [])
  );

  const showInterstitialAd = ({ onDismiss }: InterstitialAdCallback) => {
    const isAdUnsupported =
      GoogleAdMob.showAdMobInterstitialAd.isSupported?.() === false;

    if (loading || isAdUnsupported) {
      console.warn('광고가 준비되지 않았거나, 지원되지 않아요.');
      return;
    }

    dismissCallbackRef.current = onDismiss;

    GoogleAdMob.showAdMobInterstitialAd({
      options: {
        adUnitId: AD_UNIT_ID,
      },
      onEvent: (event) => {
        if (event.type === 'requested') {
          // 광고 노출이 요청됐어요.
        }
      },
      onError: (error) => {
        console.error('광고 보여주기 실패', error);
      },
    });
  };

  return {
    loading,
    showInterstitialAd,
  };
}
