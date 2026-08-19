import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SAFE_PLACEMENTS,
  type AdPlacement,
  validateAdPlacement,
} from "./policy.ts";

describe("validateAdPlacement", () => {
  it("문서 기준의 안전한 광고 배치는 위반을 만들지 않는다", () => {
    for (const placement of SAFE_PLACEMENTS) {
      assert.deepEqual(validateAdPlacement(placement), []);
    }
  });

  it("전면형 광고를 사용자 의도 없이 띄우는 패턴을 차단한다", () => {
    const placement: AdPlacement = {
      ...SAFE_PLACEMENTS[0],
      isUserInitiated: false,
    };

    assert.ok(
      validateAdPlacement(placement).some(
        (violation) => violation.code === "FULL_SCREEN_WITHOUT_USER_INTENT",
      ),
    );
  });

  it("클릭 보상과 SDK 이벤트 우회처럼 어뷰징 가능성이 큰 패턴을 차단한다", () => {
    const placement: AdPlacement = {
      ...SAFE_PLACEMENTS[1],
      givesRewardForClick: true,
      usesSdkEventsOnly: false,
      refreshesAutomatically: true,
    };

    const codes = validateAdPlacement(placement).map(
      (violation) => violation.code,
    );

    assert.ok(codes.includes("CLICK_REWARD"));
    assert.ok(codes.includes("SDK_EVENT_BYPASS"));
    assert.ok(codes.includes("MANUAL_REFRESH"));
  });

  it("배너를 CTA 주변이나 핵심 플로우에 배치하는 패턴을 차단한다", () => {
    const placement: AdPlacement = {
      ...SAFE_PLACEMENTS[2],
      isBlockingCriticalFlow: true,
      isNearPrimaryAction: true,
      sameFormatCountOnScreen: 2,
    };

    const codes = validateAdPlacement(placement).map(
      (violation) => violation.code,
    );

    assert.ok(codes.includes("CRITICAL_FLOW_BLOCKED"));
    assert.ok(codes.includes("ACCIDENTAL_CLICK_RISK"));
    assert.ok(codes.includes("DUPLICATED_FORMAT"));
  });
});
