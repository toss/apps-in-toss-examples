import {
  loadFullScreenAd,
  showFullScreenAd,
} from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";
import { TEST_AD_GROUP_IDS, validateAdPlacement } from "../ads/policy";

type FullScreenAdKind = "interstitial" | "rewarded";
type LoadState =
  "idle" | "loading" | "loaded" | "showing" | "unsupported" | "error";

type FullScreenAdLog = {
  type: "info" | "success" | "warning" | "error";
  message: string;
};

const AD_GROUP_ID_BY_KIND = {
  interstitial: TEST_AD_GROUP_IDS.interstitial,
  rewarded: TEST_AD_GROUP_IDS.rewarded,
} as const;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "알 수 없는 오류";
  }
}

export function useFullScreenAd(kind: FullScreenAdKind) {
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [logs, setLogs] = useState<FullScreenAdLog[]>([]);
  const [rewardText, setRewardText] = useState("");
  const cleanupLoadRef = useRef<(() => void) | null>(null);
  const cleanupShowRef = useRef<(() => void) | null>(null);

  const adGroupId = AD_GROUP_ID_BY_KIND[kind];
  const isLoaded = loadState === "loaded";
  const isSupported =
    loadFullScreenAd.isSupported() && showFullScreenAd.isSupported();

  const appendLog = useCallback((log: FullScreenAdLog) => {
    setLogs((prev) => [log, ...prev].slice(0, 6));
  }, []);

  const loadAd = useCallback(() => {
    if (!isSupported) {
      setLoadState("unsupported");
      appendLog({
        type: "warning",
        message:
          "현재 환경은 전면형/보상형 광고를 지원하지 않아요. 토스앱 QR 테스트 환경에서 확인해 주세요.",
      });
      return;
    }

    cleanupLoadRef.current?.();
    setLoadState("loading");
    appendLog({
      type: "info",
      message: `${adGroupId} 광고를 미리 불러오는 중이에요.`,
    });

    // 동일 adGroupId 기준으로는 한 번에 하나의 광고만 로드해요.
    // showFullScreenAd는 loaded 이벤트를 받은 뒤에만 호출해야 하므로 상태를 loaded로 명확히 분리해요.
    cleanupLoadRef.current = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "loaded") {
          setLoadState("loaded");
          appendLog({
            type: "success",
            message:
              "광고 로드가 완료됐어요. 이제 사용자가 선택했을 때만 보여 주세요.",
          });
        }
      },
      onError: (error) => {
        setLoadState("error");
        appendLog({
          type: "error",
          message: `광고 로드 실패: ${getErrorMessage(error)}`,
        });
      },
    });
  }, [adGroupId, appendLog, isSupported]);

  const showAd = useCallback(() => {
    const violations = validateAdPlacement({
      format: kind,
      label:
        kind === "rewarded" ? "선택형 보상 광고" : "콘텐츠 완료 후 전면형 광고",
      screen:
        kind === "rewarded"
          ? "사용자가 보상 받기를 누른 뒤"
          : "콘텐츠를 소비한 뒤 다음 화면으로 넘어가기 전",
      isUserInitiated: true,
      isBlockingCriticalFlow: false,
      isNearPrimaryAction: false,
      hasClearAdLabel: true,
      sameFormatCountOnScreen: 1,
      givesRewardForClick: false,
      usesSdkEventsOnly: true,
      refreshesAutomatically: false,
    });

    if (violations.length > 0) {
      appendLog({
        type: "error",
        message: violations.map((violation) => violation.message).join(" "),
      });
      return;
    }

    if (!isLoaded) {
      appendLog({
        type: "warning",
        message:
          "광고가 아직 준비되지 않았어요. load 이벤트를 받은 뒤에만 show를 호출해요.",
      });
      return;
    }

    cleanupShowRef.current?.();
    setLoadState("showing");

    // 보상형 광고의 리워드는 clicked나 dismissed가 아니라 userEarnedReward 이벤트에서만 지급해요.
    // dismissed 이벤트는 사용자가 닫았다는 의미일 뿐, 보상 지급 근거로 사용하면 안 돼요.
    cleanupShowRef.current = showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        switch (event.type) {
          case "requested":
            appendLog({
              type: "info",
              message: "광고 표시 요청이 접수됐어요.",
            });
            break;
          case "show":
            appendLog({ type: "info", message: "광고 화면이 표시됐어요." });
            break;
          case "impression":
            appendLog({
              type: "success",
              message:
                "광고 노출이 기록됐어요. 이 이벤트는 SDK가 직접 관리해야 해요.",
            });
            break;
          case "clicked":
            appendLog({
              type: "info",
              message:
                "광고 클릭 이벤트를 받았어요. 클릭 자체에는 보상을 지급하지 않아요.",
            });
            break;
          case "userEarnedReward":
            setRewardText(
              `${event.data.unitType} ${event.data.unitAmount}개 지급 대상`,
            );
            appendLog({
              type: "success",
              message:
                "보상형 광고 시청 완료 이벤트를 받았어요. 서버에서 멱등하게 리워드를 지급해 주세요.",
            });
            break;
          case "failedToShow":
            setLoadState("error");
            appendLog({ type: "error", message: "광고 표시에 실패했어요." });
            break;
          case "dismissed":
            setLoadState("idle");
            appendLog({
              type: "info",
              message:
                "광고가 닫혔어요. 다음 광고는 새로 load 한 뒤 보여 주세요.",
            });
            loadAd();
            break;
        }
      },
      onError: (error) => {
        setLoadState("error");
        appendLog({
          type: "error",
          message: `광고 표시 실패: ${getErrorMessage(error)}`,
        });
      },
    });
  }, [adGroupId, appendLog, isLoaded, kind, loadAd]);

  useEffect(() => {
    loadAd();

    return () => {
      cleanupLoadRef.current?.();
      cleanupShowRef.current?.();
    };
  }, [loadAd]);

  return {
    adGroupId,
    isLoaded,
    isSupported,
    loadState,
    logs,
    rewardText,
    loadAd,
    showAd,
  };
}
