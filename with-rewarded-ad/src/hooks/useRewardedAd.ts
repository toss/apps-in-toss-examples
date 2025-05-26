import { useCallback, useRef, useState } from 'react';
import { GoogleAdMob } from '@apps-in-toss/framework';
import { useFocusEffect } from '@react-native-bedrock/native/@react-navigation/native';

const AD_UNIT_ID = '<YOUR_AD_UNIT_ID>';

interface RewardedAdCallbacks {
  onRewarded?: () => void;
  onDismiss?: () => void;
}

export function useRewardedAd() {
  const [loading, setLoading] = useState(true);
  const cleanupRef = useRef<(() => void) | undefined>();
  const rewardCallbackRef = useRef<(() => void) | undefined>();
  const dismissCallbackRef = useRef<(() => void) | undefined>();

  const loadRewardAd = useCallback(() => {
    setLoading(true);

    const isAdUnsupported =
      GoogleAdMob.loadAdMobRewardedAd.isSupported?.() === false;

    if (isAdUnsupported) {
      console.warn('광고가 준비되지 않았거나, 지원되지 않아요.');
      return;
    }

    cleanupRef.current?.();
    cleanupRef.current = undefined;

    const cleanup = GoogleAdMob.loadAdMobRewardedAd({
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
          case 'userEarnedReward':
            rewardCallbackRef.current?.();
            rewardCallbackRef.current = undefined;
            break;
        }
      },
      onError: (error) => {
        console.error('광고 로드 실패', error);
      },
    });

    cleanupRef.current = cleanup;
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRewardAd();

      return () => {
        cleanupRef.current?.();
      };
    }, [loadRewardAd])
  );

  const showRewardAd = ({ onRewarded, onDismiss }: RewardedAdCallbacks) => {
    const isAdUnsupported =
      GoogleAdMob.showAdMobRewardedAd.isSupported?.() === false;

    if (loading || isAdUnsupported) {
      console.warn('광고가 준비되지 않았거나, 지원되지 않아요.');
      return;
    }

    rewardCallbackRef.current = onRewarded;
    dismissCallbackRef.current = onDismiss;

    GoogleAdMob.showAdMobRewardedAd({
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
    loadRewardAd,
    showRewardAd,
  };
}
