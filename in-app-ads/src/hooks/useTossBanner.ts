import {
  TossAds,
  type TossAdsAttachBannerOptions,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useState } from "react";

type BannerStatus = "idle" | "initializing" | "ready" | "unsupported" | "error";

let sharedInitializePromise: Promise<void> | null = null;

function initializeOnce() {
  if (sharedInitializePromise != null) {
    return sharedInitializePromise;
  }

  sharedInitializePromise = new Promise<void>((resolve, reject) => {
    TossAds.initialize({
      callbacks: {
        onInitialized: () => resolve(),
        onInitializationFailed: (error) => reject(error),
      },
    });
  });

  return sharedInitializePromise;
}

export function useTossBanner() {
  const [status, setStatus] = useState<BannerStatus>("idle");
  const isSupported =
    TossAds.initialize.isSupported() && TossAds.attachBanner.isSupported();

  useEffect(() => {
    if (!isSupported) {
      setStatus("unsupported");
      return;
    }

    setStatus("initializing");

    // 배너 SDK 초기화는 앱 전체에서 한 번만 수행해요.
    // 컴포넌트마다 initialize를 호출하면 중복 초기화 오류가 날 수 있어 Promise를 공유해요.
    initializeOnce()
      .then(() => setStatus("ready"))
      .catch((error) => {
        console.error("Toss Ads SDK initialization failed:", error);
        setStatus("error");
      });
  }, [isSupported]);

  const attachBanner = useCallback(
    (
      adGroupId: string,
      element: HTMLElement,
      options?: TossAdsAttachBannerOptions,
    ) => {
      if (status !== "ready") {
        return undefined;
      }

      return TossAds.attachBanner(adGroupId, element, options);
    },
    [status],
  );

  const destroyAll = useCallback(() => {
    if (TossAds.destroyAll.isSupported()) {
      TossAds.destroyAll();
    }
  }, []);

  return {
    status,
    isReady: status === "ready",
    isSupported,
    attachBanner,
    destroyAll,
  };
}
