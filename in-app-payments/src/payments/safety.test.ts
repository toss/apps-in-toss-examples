import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PAYMENT_CHECKLIST,
  buildOrderStatusRequest,
  canCompleteGrant,
  getGrantFailureReason,
} from "./safety.ts";

describe("in-app payment safety helpers", () => {
  it("필수 샌드박스 테스트 항목을 포함한다", () => {
    const requiredIds = PAYMENT_CHECKLIST.filter((item) => item.required).map(
      (item) => item.id,
    );

    assert.deepEqual(requiredIds, [
      "product-list",
      "success",
      "grant-failure",
      "pending-restore",
      "history",
    ]);
  });

  it("서버 지급이 성공하고 중복 주문이 아닐 때만 지급 완료 처리한다", () => {
    assert.equal(
      canCompleteGrant({
        orderId: "order-1",
        alreadyGranted: false,
        serverGrantSucceeded: true,
      }),
      true,
    );

    assert.equal(
      canCompleteGrant({
        orderId: "order-1",
        alreadyGranted: true,
        serverGrantSucceeded: true,
      }),
      false,
    );
  });

  it("서버 지급 실패는 pending 복원 대상으로 남긴다", () => {
    const decision = {
      orderId: "order-2",
      alreadyGranted: false,
      serverGrantSucceeded: false,
    };

    assert.equal(canCompleteGrant(decision), false);
    assert.match(getGrantFailureReason(decision) ?? "", /미결 주문/);
  });

  it("서버 주문 상태 조회 요청 payload를 만든다", () => {
    assert.deepEqual(buildOrderStatusRequest("order-3", " user-key "), {
      method: "POST",
      path: "/api-partner/v1/apps-in-toss/order/get-order-status",
      headers: {
        "Content-Type": "application/json",
        "x-toss-user-key": "user-key",
      },
      body: {
        orderId: "order-3",
      },
    });
  });
});
