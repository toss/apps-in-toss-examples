export type AdFormat = "interstitial" | "rewarded" | "banner";

export type AdPlacement = {
  format: AdFormat;
  label: string;
  screen: string;
  isUserInitiated: boolean;
  isBlockingCriticalFlow: boolean;
  isNearPrimaryAction: boolean;
  hasClearAdLabel: boolean;
  sameFormatCountOnScreen: number;
  givesRewardForClick: boolean;
  usesSdkEventsOnly: boolean;
  refreshesAutomatically: boolean;
};

export type PolicyViolation = {
  code:
    | "MISSING_AD_LABEL"
    | "CRITICAL_FLOW_BLOCKED"
    | "ACCIDENTAL_CLICK_RISK"
    | "DUPLICATED_FORMAT"
    | "CLICK_REWARD"
    | "SDK_EVENT_BYPASS"
    | "MANUAL_REFRESH"
    | "FULL_SCREEN_WITHOUT_USER_INTENT";
  message: string;
};

/**
 * 개발 단계에서만 쓰는 테스트 광고 ID예요.
 * 실제 서비스 검수나 출시 전에는 앱인토스 콘솔에서 발급받은 광고 그룹 ID로 교체해 주세요.
 */
export const TEST_AD_GROUP_IDS = {
  interstitial: "ait-ad-test-interstitial-id",
  rewarded: "ait-ad-test-rewarded-id",
  banner: "ait-ad-test-banner-id",
  nativeImageBanner: "ait-ad-test-native-image-id",
} as const;

/**
 * 정책 위반 가능성이 높은 배치 조건을 실행 전에 점검해요.
 * 이 함수는 SDK 정책을 대체하지 않고, 예제 코드에서 금지 패턴을 눈에 띄게 막기 위한 방어막이에요.
 */
export function validateAdPlacement(placement: AdPlacement): PolicyViolation[] {
  const violations: PolicyViolation[] = [];

  if (!placement.hasClearAdLabel) {
    violations.push({
      code: "MISSING_AD_LABEL",
      message:
        "광고는 콘텐츠나 추천 영역처럼 보이면 안 돼요. SDK가 제공하는 Ad 표기를 유지해 주세요.",
    });
  }

  if (placement.isBlockingCriticalFlow) {
    violations.push({
      code: "CRITICAL_FLOW_BLOCKED",
      message:
        "결제, 인증, 계좌 개설처럼 사용자의 핵심 목표가 진행 중인 화면에는 광고를 끼워 넣지 마세요.",
    });
  }

  if (placement.isNearPrimaryAction) {
    violations.push({
      code: "ACCIDENTAL_CLICK_RISK",
      message:
        "주요 CTA, 게임 조작 영역, 닫기 버튼 근처에 광고를 두면 의도치 않은 클릭을 유도할 수 있어요.",
    });
  }

  if (placement.sameFormatCountOnScreen > 1) {
    violations.push({
      code: "DUPLICATED_FORMAT",
      message:
        "동일 화면에 동일 포맷 광고를 2개 이상 배치하면 광고와 콘텐츠의 구분이 흐려져요.",
    });
  }

  if (placement.givesRewardForClick) {
    violations.push({
      code: "CLICK_REWARD",
      message:
        "광고 클릭 자체를 보상 조건으로 삼으면 안 돼요. 리워드는 userEarnedReward 이벤트에서만 지급해 주세요.",
    });
  }

  if (!placement.usesSdkEventsOnly) {
    violations.push({
      code: "SDK_EVENT_BYPASS",
      message:
        "Click, Impression, Viewable 이벤트를 직접 만들거나 우회하지 말고 SDK 이벤트만 사용해 주세요.",
    });
  }

  if (placement.refreshesAutomatically) {
    violations.push({
      code: "MANUAL_REFRESH",
      message:
        "광고 영역을 주기적으로 새로고침해 노출 성과를 인위적으로 만들면 정책 위반이에요.",
    });
  }

  if (
    (placement.format === "interstitial" || placement.format === "rewarded") &&
    !placement.isUserInitiated
  ) {
    violations.push({
      code: "FULL_SCREEN_WITHOUT_USER_INTENT",
      message:
        "전면형/보상형 광고는 사용자가 예측할 수 있는 버튼이나 화면 전환 맥락에서만 보여 주세요.",
    });
  }

  return violations;
}

export const SAFE_PLACEMENTS: AdPlacement[] = [
  {
    format: "interstitial",
    label: "콘텐츠 완료 후 전면형 광고",
    screen: "아티클을 끝까지 읽은 뒤 다음 추천 콘텐츠로 이동하기 전",
    isUserInitiated: true,
    isBlockingCriticalFlow: false,
    isNearPrimaryAction: false,
    hasClearAdLabel: true,
    sameFormatCountOnScreen: 1,
    givesRewardForClick: false,
    usesSdkEventsOnly: true,
    refreshesAutomatically: false,
  },
  {
    format: "rewarded",
    label: "선택형 보상 광고",
    screen: "사용자가 보상 받기를 누른 뒤",
    isUserInitiated: true,
    isBlockingCriticalFlow: false,
    isNearPrimaryAction: false,
    hasClearAdLabel: true,
    sameFormatCountOnScreen: 1,
    givesRewardForClick: false,
    usesSdkEventsOnly: true,
    refreshesAutomatically: false,
  },
  {
    format: "banner",
    label: "콘텐츠 사이 배너",
    screen: "목록 중간의 독립된 광고 슬롯",
    isUserInitiated: false,
    isBlockingCriticalFlow: false,
    isNearPrimaryAction: false,
    hasClearAdLabel: true,
    sameFormatCountOnScreen: 1,
    givesRewardForClick: false,
    usesSdkEventsOnly: true,
    refreshesAutomatically: false,
  },
];
