import { IAP } from "@apps-in-toss/web-framework";
import { useCallback, useEffect, useRef, useState } from "react";
import { canCompleteGrant, getGrantFailureReason } from "../payments/safety";

export type ProductItem = {
  sku: string;
  displayAmount: string;
  displayName: string;
  iconUrl?: string;
  description?: string;
};

export type PendingOrder = {
  orderId: string;
  sku?: string;
  paymentCompletedDate?: string;
};

export type CompletedOrRefundedOrder = {
  orderId: string;
  sku: string;
  status: "COMPLETED" | "REFUNDED";
  date: string;
};

export type PaymentLog = {
  type: "info" | "success" | "warning" | "error";
  message: string;
};

type PurchaseOptions = {
  simulateGrantFailure: boolean;
};

type CompletedOrRefundedOrdersResult = {
  hasNext: boolean;
  nextKey?: string | null;
  orders: CompletedOrRefundedOrder[];
};

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

function readGrantedOrderIds() {
  try {
    return new Set(
      JSON.parse(localStorage.getItem("iapGrantedOrderIds") ?? "[]"),
    );
  } catch {
    return new Set<string>();
  }
}

function saveGrantedOrderId(orderId: string) {
  const grantedOrderIds = readGrantedOrderIds();
  grantedOrderIds.add(orderId);
  localStorage.setItem(
    "iapGrantedOrderIds",
    JSON.stringify([...grantedOrderIds]),
  );
}

export function useInAppPayments() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [historyOrders, setHistoryOrders] = useState<
    CompletedOrRefundedOrder[]
  >([]);
  const [historyNextKey, setHistoryNextKey] = useState<string | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [purchasingSku, setPurchasingSku] = useState<string | null>(null);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  const appendLog = useCallback((log: PaymentLog) => {
    setLogs((prev) => [log, ...prev].slice(0, 8));
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsProductLoading(true);

    try {
      const response = await IAP.getProductItemList();
      const fetchedProducts = response?.products ?? [];

      setProducts(fetchedProducts);
      appendLog({
        type: fetchedProducts.length > 0 ? "success" : "warning",
        message:
          fetchedProducts.length > 0
            ? `상품 ${fetchedProducts.length}개를 불러왔어요.`
            : "노출 ON 상태의 인앱 상품이 없어요. 콘솔에서 상품을 등록해 주세요.",
      });
    } catch (error) {
      appendLog({
        type: "error",
        message: `상품 목록 조회 실패: ${getErrorMessage(error)}`,
      });
    } finally {
      setIsProductLoading(false);
    }
  }, [appendLog]);

  const grantProduct = useCallback(
    async (
      order: { orderId: string; sku?: string },
      simulateFailure = false,
    ) => {
      const grantedOrderIds = readGrantedOrderIds();
      const decision = {
        orderId: order.orderId,
        sku: order.sku,
        alreadyGranted: grantedOrderIds.has(order.orderId),
        serverGrantSucceeded: !simulateFailure,
      };

      if (!canCompleteGrant(decision)) {
        appendLog({
          type: "warning",
          message: getGrantFailureReason(decision) ?? "상품 지급을 보류했어요.",
        });
        return false;
      }

      // 실제 서비스에서는 이 위치에서 파트너 서버에 지급 요청을 보내고,
      // 서버가 orderId 기준으로 멱등하게 지급 완료를 기록한 뒤 true를 반환해야 해요.
      saveGrantedOrderId(order.orderId);
      appendLog({
        type: "success",
        message: `상품 지급 완료: ${order.orderId}`,
      });
      return true;
    },
    [appendLog],
  );

  const purchaseProduct = useCallback(
    (sku: string, options: PurchaseOptions) => {
      cleanupRef.current?.();
      setPurchasingSku(sku);
      appendLog({
        type: "info",
        message: `${sku} 주문서를 생성했어요. 결제창에서 성공/취소/오류 시나리오를 확인해 주세요.`,
      });

      try {
        let cleanup: (() => void) | null = null;

        cleanup = IAP.createOneTimePurchaseOrder({
          options: {
            sku,
            processProductGrant: async ({ orderId }) => {
              const granted = await grantProduct(
                { orderId, sku },
                options.simulateGrantFailure,
              );

              // false를 반환하면 결제는 완료됐지만 지급이 끝나지 않은 상태로 남을 수 있어요.
              // 이후 getPendingOrders로 조회하고 completeProductGrant까지 호출해야 해요.
              return granted;
            },
          },
          onEvent: (event) => {
            if (event.type === "success") {
              appendLog({
                type: "success",
                message: `결제 성공: ${event.data.displayName} (${event.data.orderId})`,
              });
            }

            setPurchasingSku(null);
            cleanup?.();
            cleanupRef.current = null;
          },
          onError: (error) => {
            appendLog({
              type: "error",
              message: `결제 실패 또는 취소: ${getErrorMessage(error)}`,
            });
            setPurchasingSku(null);
            cleanup?.();
            cleanupRef.current = null;
          },
        });

        cleanupRef.current = cleanup;
      } catch (error) {
        appendLog({
          type: "error",
          message: `결제창 호출 실패: ${getErrorMessage(error)}`,
        });
        setPurchasingSku(null);
      }
    },
    [appendLog, grantProduct],
  );

  const fetchPendingOrders = useCallback(async () => {
    setIsPendingLoading(true);

    try {
      const response = await IAP.getPendingOrders();
      const orders = response?.orders ?? [];

      setPendingOrders(orders);
      appendLog({
        type: orders.length > 0 ? "warning" : "success",
        message:
          orders.length > 0
            ? `미결 주문 ${orders.length}개를 찾았어요.`
            : "복원할 미결 주문이 없어요.",
      });
    } catch (error) {
      appendLog({
        type: "error",
        message: `미결 주문 조회 실패: ${getErrorMessage(error)}`,
      });
    } finally {
      setIsPendingLoading(false);
    }
  }, [appendLog]);

  const restorePendingOrder = useCallback(
    async (order: PendingOrder) => {
      const granted = await grantProduct(order);

      if (!granted) {
        return;
      }

      try {
        const completed = await IAP.completeProductGrant({
          params: { orderId: order.orderId },
        });

        appendLog({
          type: completed === false ? "warning" : "success",
          message:
            completed === false
              ? `지급 완료 확정 실패: ${order.orderId}`
              : `지급 완료 확정: ${order.orderId}`,
        });
        await fetchPendingOrders();
      } catch (error) {
        appendLog({
          type: "error",
          message: `completeProductGrant 실패: ${getErrorMessage(error)}`,
        });
      }
    },
    [appendLog, fetchPendingOrders, grantProduct],
  );

  const fetchHistoryOrders = useCallback(
    async (next = false) => {
      setIsHistoryLoading(true);

      try {
        const response = (await IAP.getCompletedOrRefundedOrders({
          key: next ? historyNextKey : null,
        })) as CompletedOrRefundedOrdersResult | undefined;
        const orders = response?.orders ?? [];

        setHistoryOrders((prev) => (next ? [...prev, ...orders] : orders));
        setHistoryNextKey(
          response?.hasNext ? (response.nextKey ?? null) : null,
        );
        appendLog({
          type: "info",
          message: `완료/환불 주문 ${orders.length}개를 조회했어요.`,
        });
      } catch (error) {
        appendLog({
          type: "error",
          message: `완료/환불 주문 조회 실패: ${getErrorMessage(error)}`,
        });
      } finally {
        setIsHistoryLoading(false);
      }
    },
    [appendLog, historyNextKey],
  );

  useEffect(() => {
    fetchProducts();
    fetchPendingOrders();

    return () => {
      cleanupRef.current?.();
    };
  }, [fetchPendingOrders, fetchProducts]);

  return {
    products,
    pendingOrders,
    historyOrders,
    historyNextKey,
    isProductLoading,
    isPendingLoading,
    isHistoryLoading,
    purchasingSku,
    logs,
    fetchProducts,
    purchaseProduct,
    fetchPendingOrders,
    restorePendingOrder,
    fetchHistoryOrders,
  };
}
