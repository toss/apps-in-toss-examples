export type GrantDecision = {
  orderId: string;
  sku?: string;
  alreadyGranted: boolean;
  serverGrantSucceeded: boolean;
};

export type PaymentChecklistItem = {
  id:
    | "product-list"
    | "success"
    | "grant-failure"
    | "pending-restore"
    | "history"
    | "server-status";
  title: string;
  required: boolean;
  description: string;
};

export const PAYMENT_CHECKLIST: PaymentChecklistItem[] = [
  {
    id: "product-list",
    title: "상품 목록 조회",
    required: true,
    description:
      "콘솔에 등록했고 노출 ON 상태인 상품이 샌드박스 앱에서 내려오는지 확인해요.",
  },
  {
    id: "success",
    title: "결제 성공",
    required: true,
    description:
      "success 이벤트의 orderId, sku, 금액 정보를 기록하고 지급 결과를 화면에 반영해요.",
  },
  {
    id: "grant-failure",
    title: "결제 성공 + 지급 실패",
    required: true,
    description:
      "파트너 서버 지급 실패를 가정하고 getPendingOrders로 복원 가능한지 확인해요.",
  },
  {
    id: "pending-restore",
    title: "미결 주문 복원",
    required: true,
    description:
      "앱 재진입 시 pending 주문을 조회하고 지급 후 completeProductGrant를 호출해요.",
  },
  {
    id: "history",
    title: "완료/환불 주문 조회",
    required: true,
    description:
      "구매 완료와 환불 상태를 조회해 사용자의 이용권, 아이템, 결제 내역과 동기화해요.",
  },
  {
    id: "server-status",
    title: "서버 주문 상태 조회",
    required: false,
    description:
      "파트너 서버에서 mTLS로 주문 상태 조회 API를 호출해 클라이언트 이벤트 누락에 대비해요.",
  },
];

/**
 * processProductGrant 콜백에서 true를 반환해도 되는지 결정해요.
 * 실제 서비스에서는 localStorage가 아니라 파트너 서버에서 orderId 기준으로 멱등하게 검사해야 해요.
 */
export function canCompleteGrant(decision: GrantDecision) {
  return (
    decision.orderId.trim().length > 0 &&
    !decision.alreadyGranted &&
    decision.serverGrantSucceeded
  );
}

export function getGrantFailureReason(decision: GrantDecision) {
  if (decision.orderId.trim().length === 0) {
    return "orderId가 없어 상품 지급을 확정할 수 없어요.";
  }

  if (decision.alreadyGranted) {
    return "이미 지급 처리한 orderId예요. 중복 지급을 막았어요.";
  }

  if (!decision.serverGrantSucceeded) {
    return "파트너 서버의 상품 지급이 실패했어요. 미결 주문 복원 대상으로 남겨야 해요.";
  }

  return null;
}

export function buildOrderStatusRequest(orderId: string, userKey?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (userKey != null && userKey.trim().length > 0) {
    headers["x-toss-user-key"] = userKey.trim();
  }

  return {
    method: "POST",
    path: "/api-partner/v1/apps-in-toss/order/get-order-status",
    headers,
    body: {
      orderId,
    },
  };
}
