import { useMemo, useState } from "react";
import "./App.css";
import { useInAppPayments } from "./hooks/useInAppPayments";
import type {
  CompletedOrRefundedOrder,
  PaymentLog,
  PendingOrder,
  ProductItem,
} from "./hooks/useInAppPayments";
import { PAYMENT_CHECKLIST, buildOrderStatusRequest } from "./payments/safety";

type TabKey = "products" | "pending" | "history" | "checklist";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "products", label: "상품" },
  { key: "pending", label: "복원" },
  { key: "history", label: "내역" },
  { key: "checklist", label: "체크" },
];

function App() {
  const [selectedTab, setSelectedTab] = useState<TabKey>("products");
  const [simulateGrantFailure, setSimulateGrantFailure] = useState(false);
  const [orderIdForServerCheck, setOrderIdForServerCheck] = useState(
    "13c9a1ff-2baa-4495-bbfa-a0826ba8c7c0",
  );
  const payment = useInAppPayments();

  const serverStatusRequest = useMemo(
    () => buildOrderStatusRequest(orderIdForServerCheck),
    [orderIdForServerCheck],
  );

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Apps in Toss Monetization</p>
        <h1>인앱 결제 예제</h1>
        <p>
          상품 목록 조회, 일회성 결제, 지급 실패 복원, 완료/환불 주문 조회까지
          결제 운영에 필요한 흐름을 확인해요.
        </p>
      </header>

      <nav className="tab-list" aria-label="인앱 결제 예제 탭">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={selectedTab === tab.key ? "active" : ""}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {selectedTab === "products" && (
        <ProductsPanel
          products={payment.products}
          isLoading={payment.isProductLoading}
          purchasingSku={payment.purchasingSku}
          simulateGrantFailure={simulateGrantFailure}
          onToggleGrantFailure={setSimulateGrantFailure}
          onRefresh={payment.fetchProducts}
          onPurchase={payment.purchaseProduct}
        />
      )}
      {selectedTab === "pending" && (
        <PendingPanel
          orders={payment.pendingOrders}
          isLoading={payment.isPendingLoading}
          onRefresh={payment.fetchPendingOrders}
          onRestore={payment.restorePendingOrder}
        />
      )}
      {selectedTab === "history" && (
        <HistoryPanel
          orders={payment.historyOrders}
          hasNext={payment.historyNextKey != null}
          isLoading={payment.isHistoryLoading}
          onRefresh={() => payment.fetchHistoryOrders(false)}
          onLoadMore={() => payment.fetchHistoryOrders(true)}
        />
      )}
      {selectedTab === "checklist" && (
        <ChecklistPanel
          orderId={orderIdForServerCheck}
          serverStatusRequest={serverStatusRequest}
          onOrderIdChange={setOrderIdForServerCheck}
        />
      )}

      <EventLog logs={payment.logs} />
    </main>
  );
}

function ProductsPanel({
  products,
  isLoading,
  purchasingSku,
  simulateGrantFailure,
  onToggleGrantFailure,
  onRefresh,
  onPurchase,
}: {
  products: ProductItem[];
  isLoading: boolean;
  purchasingSku: string | null;
  simulateGrantFailure: boolean;
  onToggleGrantFailure: (checked: boolean) => void;
  onRefresh: () => void;
  onPurchase: (sku: string, options: { simulateGrantFailure: boolean }) => void;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>상품 목록과 결제 요청</h2>
        <p>
          콘솔에서 등록하고 노출 ON으로 설정한 상품을 조회한 뒤, 선택한 상품의
          일회성 결제 주문을 생성해요.
        </p>
      </div>

      <label className="toggle-row">
        <input
          type="checkbox"
          checked={simulateGrantFailure}
          onChange={(event) => onToggleGrantFailure(event.target.checked)}
        />
        <span>결제 성공 후 파트너 서버 지급 실패 시나리오로 테스트</span>
      </label>

      <button type="button" className="secondary" onClick={onRefresh}>
        상품 목록 새로고침
      </button>

      {isLoading && (
        <div className="status-panel">상품을 불러오는 중이에요.</div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="empty-panel">
          <strong>인앱 상품이 없어요</strong>
          <p>
            콘솔 인앱 결제 메뉴에서 상품을 등록하고 노출을 ON으로 바꿔 주세요.
            콘솔 MCP 서버가 연결되어 있다면 에이전트에게 테스트 상품 등록을
            요청할 수 있어요.
          </p>
        </div>
      )}

      <div className="product-list">
        {products.map((product) => (
          <ProductRow
            key={product.sku}
            product={product}
            isPurchasing={purchasingSku === product.sku}
            isDisabled={purchasingSku != null}
            onPurchase={() => onPurchase(product.sku, { simulateGrantFailure })}
          />
        ))}
      </div>

      <div className="guideline-list">
        <strong>구매 구현 기준</strong>
        <ul>
          <li>
            `processProductGrant`는 30초 안에 지급 성공 여부를 반환해야 해요.
          </li>
          <li>
            상품 지급은 `orderId` 기준으로 멱등하게 처리해 중복 지급을 막아요.
          </li>
          <li>
            지급 실패 시 앱 재진입에서 `getPendingOrders`로 복원해야 해요.
          </li>
        </ul>
      </div>
    </section>
  );
}

function ProductRow({
  product,
  isPurchasing,
  isDisabled,
  onPurchase,
}: {
  product: ProductItem;
  isPurchasing: boolean;
  isDisabled: boolean;
  onPurchase: () => void;
}) {
  return (
    <article className="product-row">
      {product.iconUrl ? (
        <img className="product-icon" src={product.iconUrl} alt="" />
      ) : (
        <div className="product-icon fallback" aria-hidden />
      )}
      <div className="product-body">
        <strong>{product.displayName}</strong>
        {product.description && <p>{product.description}</p>}
        <span>{product.displayAmount}</span>
        <code>{product.sku}</code>
      </div>
      <button type="button" disabled={isDisabled} onClick={onPurchase}>
        {isPurchasing ? "처리 중" : "구매"}
      </button>
    </article>
  );
}

function PendingPanel({
  orders,
  isLoading,
  onRefresh,
  onRestore,
}: {
  orders: PendingOrder[];
  isLoading: boolean;
  onRefresh: () => void;
  onRestore: (order: PendingOrder) => void;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>미결 주문 복원</h2>
        <p>
          결제는 완료됐지만 상품 지급이 끝나지 않은 주문을 조회하고, 지급 후
          `completeProductGrant`로 완료 처리해요.
        </p>
      </div>

      <button type="button" className="secondary" onClick={onRefresh}>
        미결 주문 조회
      </button>

      {isLoading && (
        <div className="status-panel">미결 주문을 조회 중이에요.</div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="empty-panel">
          <strong>복원할 주문이 없어요</strong>
          <p>
            샌드박스에서 결제 성공 후 지급 실패 시나리오를 실행하면 이 목록에서
            복원 흐름을 확인할 수 있어요.
          </p>
        </div>
      )}

      <div className="order-list">
        {orders.map((order) => (
          <article key={order.orderId} className="order-row">
            <div>
              <strong>{order.sku ?? "sku 미제공"}</strong>
              <p>{order.paymentCompletedDate ?? "결제 완료 시각 미제공"}</p>
              <code>{order.orderId}</code>
            </div>
            <button type="button" onClick={() => onRestore(order)}>
              지급 복원
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function HistoryPanel({
  orders,
  hasNext,
  isLoading,
  onRefresh,
  onLoadMore,
}: {
  orders: CompletedOrRefundedOrder[];
  hasNext: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>완료/환불 주문 조회</h2>
        <p>
          완료된 구매와 환불된 주문을 조회해 이용권, 아이템, 결제 내역을
          동기화해요.
        </p>
      </div>

      <button type="button" className="secondary" onClick={onRefresh}>
        완료/환불 주문 조회
      </button>

      {isLoading && (
        <div className="status-panel">주문 내역을 조회 중이에요.</div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="empty-panel">
          <strong>조회된 주문이 없어요</strong>
          <p>구매 또는 환불된 주문이 있으면 이 영역에 표시돼요.</p>
        </div>
      )}

      <div className="order-list">
        {orders.map((order) => (
          <article key={order.orderId} className="order-row">
            <div>
              <strong>{order.status}</strong>
              <p>
                {order.sku} · {order.date}
              </p>
              <code>{order.orderId}</code>
            </div>
          </article>
        ))}
      </div>

      {hasNext && (
        <button type="button" className="secondary" onClick={onLoadMore}>
          다음 페이지 조회
        </button>
      )}
    </section>
  );
}

function ChecklistPanel({
  orderId,
  serverStatusRequest,
  onOrderIdChange,
}: {
  orderId: string;
  serverStatusRequest: ReturnType<typeof buildOrderStatusRequest>;
  onOrderIdChange: (value: string) => void;
}) {
  return (
    <section className="section">
      <div className="section-heading">
        <h2>출시 전 체크리스트</h2>
        <p>
          샌드박스에서는 결제 성공, 지급 실패, 오류 시나리오를 각각 테스트해야
          해요.
        </p>
      </div>

      <div className="checklist">
        {PAYMENT_CHECKLIST.map((item) => (
          <article key={item.id} className="checklist-item">
            <span>{item.required ? "필수" : "권장"}</span>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>

      <label className="input-field">
        <span>서버 주문 상태 조회 orderId</span>
        <input
          value={orderId}
          onChange={(event) => onOrderIdChange(event.target.value)}
        />
      </label>

      <pre className="code-block">
        {JSON.stringify(serverStatusRequest, null, 2)}
      </pre>

      <div className="guideline-list">
        <strong>서버 연동 기준</strong>
        <ul>
          <li>주문 상태 조회 API는 파트너 서버에서 mTLS 인증서로 호출해요.</li>
          <li>
            토스 로그인으로 얻은 `userKey`가 있으면 `x-toss-user-key`로 좁혀요.
          </li>
          <li>
            클라이언트 이벤트 누락에 대비해 서버에서도 주문 상태를 검증해요.
          </li>
        </ul>
      </div>
    </section>
  );
}

function EventLog({ logs }: { logs: PaymentLog[] }) {
  if (logs.length === 0) {
    return (
      <section className="event-log empty">
        <span>이벤트 로그</span>
        <p>아직 수신한 이벤트가 없어요.</p>
      </section>
    );
  }

  return (
    <section className="event-log">
      <span>이벤트 로그</span>
      <ul>
        {logs.map((log, index) => (
          <li key={`${log.message}-${index}`} className={log.type}>
            {log.message}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default App;
