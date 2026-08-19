import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  SAFE_PLACEMENTS,
  TEST_AD_GROUP_IDS,
  validateAdPlacement,
} from "./ads/policy";
import { useFullScreenAd } from "./hooks/useFullScreenAd";
import { useTossBanner } from "./hooks/useTossBanner";

type TabKey = "interstitial" | "rewarded" | "banner" | "policy";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "interstitial", label: "전면형" },
  { key: "rewarded", label: "보상형" },
  { key: "banner", label: "배너" },
  { key: "policy", label: "정책" },
];

function getStateLabel(state: string) {
  const labels: Record<string, string> = {
    idle: "대기",
    loading: "로드 중",
    loaded: "로드 완료",
    showing: "표시 중",
    unsupported: "미지원",
    error: "오류",
    initializing: "초기화 중",
    ready: "준비 완료",
  };

  return labels[state] ?? state;
}

function FullScreenAdPanel({ kind }: { kind: "interstitial" | "rewarded" }) {
  const ad = useFullScreenAd(kind);
  const isRewarded = kind === "rewarded";

  return (
    <section className="section">
      <div className="section-heading">
        <h2>{isRewarded ? "보상형 광고" : "전면형 광고"}</h2>
        <p>
          광고는 화면 진입 시 미리 로드하고, 사용자가 명확히 선택한 뒤에만
          표시해요.
        </p>
      </div>

      <div className={`status-panel ${ad.loadState}`}>
        <span>상태</span>
        <strong>{getStateLabel(ad.loadState)}</strong>
        <p>{ad.adGroupId}</p>
      </div>

      {ad.rewardText && (
        <div className="reward-panel">
          <span>리워드 이벤트</span>
          <strong>{ad.rewardText}</strong>
          <p>
            실제 서비스에서는 서버에서 orderId나 userId 같은 멱등 키로 중복
            지급을 막아 주세요.
          </p>
        </div>
      )}

      <div className="button-group">
        <button type="button" className="secondary" onClick={ad.loadAd}>
          광고 다시 로드
        </button>
        <button type="button" onClick={ad.showAd} disabled={!ad.isLoaded}>
          {isRewarded ? "광고 보고 보상 받기" : "다음 콘텐츠 전에 광고 보기"}
        </button>
      </div>

      <div className="guideline-list">
        <strong>이 패널의 안전 장치</strong>
        <ul>
          <li>`loaded` 이벤트를 받은 뒤에만 표시 버튼이 활성화돼요.</li>
          <li>클릭이나 닫기 이벤트로 리워드를 지급하지 않아요.</li>
          <li>광고가 닫힌 뒤 다음 광고를 새로 로드해요.</li>
        </ul>
      </div>

      <EventLog logs={ad.logs} />
    </section>
  );
}

function BannerAdPanel() {
  const bannerElementRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<string[]>([]);
  const { status, isReady, attachBanner, destroyAll } = useTossBanner();

  const appendEvent = (message: string) => {
    setEvents((prev) => [message, ...prev].slice(0, 6));
  };

  useEffect(() => {
    const target = bannerElementRef.current;

    if (!isReady || target == null) {
      return;
    }

    target.innerHTML = "";

    // 배너 슬롯은 SDK가 렌더링할 빈 DOM이어야 해요.
    // 콘텐츠 카드 안에 숨기거나 CTA 옆에 붙이지 않고, 독립된 100% 너비 슬롯으로 유지해요.
    const attached = attachBanner(TEST_AD_GROUP_IDS.banner, target, {
      theme: "auto",
      tone: "blackAndWhite",
      variant: "expanded",
      callbacks: {
        onAdRendered: (payload) =>
          appendEvent(`렌더링 완료: ${payload.slotId}`),
        onAdImpression: (payload) =>
          appendEvent(`화면 노출: ${payload.slotId}`),
        onAdViewable: (payload) => appendEvent(`노출 기록: ${payload.slotId}`),
        onAdClicked: (payload) => appendEvent(`클릭 이벤트: ${payload.slotId}`),
        onNoFill: (payload) =>
          appendEvent(`표시할 광고 없음: ${payload.slotId}`),
        onAdFailedToRender: (payload) =>
          appendEvent(`렌더링 실패: ${payload.error.message}`),
      },
    });

    return () => {
      attached?.destroy();
    };
  }, [attachBanner, isReady]);

  return (
    <section className="section">
      <div className="section-heading">
        <h2>배너 광고</h2>
        <p>앱 시작 시 SDK를 한 번 초기화하고, 빈 컨테이너에 배너를 부착해요.</p>
      </div>

      <div className={`status-panel ${status}`}>
        <span>SDK 상태</span>
        <strong>{getStateLabel(status)}</strong>
        <p>{TEST_AD_GROUP_IDS.banner}</p>
      </div>

      <div className="content-preview">
        <p className="content-kicker">콘텐츠 영역</p>
        <h3>이번 달 지출 리포트</h3>
        <p>
          배너는 콘텐츠와 CTA 사이를 가로막지 않는 독립 슬롯에 배치해요. 광고
          클릭을 유도하는 문구나 보상 문구를 함께 두지 않아요.
        </p>
      </div>

      <div
        ref={bannerElementRef}
        className="banner-slot"
        aria-label="Toss Ads banner slot"
      />

      <button type="button" className="secondary" onClick={destroyAll}>
        모든 배너 슬롯 제거
      </button>

      <div className="guideline-list">
        <strong>배너 배치 기준</strong>
        <ul>
          <li>컨테이너는 `width: 100%`를 유지해요.</li>
          <li>고정형 배너는 `height: 96px`을 권장해요.</li>
          <li>SDK의 자동 갱신 외에 주기적 refresh를 직접 만들지 않아요.</li>
        </ul>
      </div>

      <EventLog
        logs={events.map((message) => ({ type: "info" as const, message }))}
      />
    </section>
  );
}

function PolicyPanel() {
  const safeResults = useMemo(
    () =>
      SAFE_PLACEMENTS.map((placement) => ({
        placement,
        violations: validateAdPlacement(placement),
      })),
    [],
  );

  const blockedExample = validateAdPlacement({
    format: "rewarded",
    label: "광고 클릭하면 포인트 지급",
    screen: "결제 버튼 바로 아래",
    isUserInitiated: false,
    isBlockingCriticalFlow: true,
    isNearPrimaryAction: true,
    hasClearAdLabel: false,
    sameFormatCountOnScreen: 2,
    givesRewardForClick: true,
    usesSdkEventsOnly: false,
    refreshesAutomatically: true,
  });

  return (
    <section className="section">
      <div className="section-heading">
        <h2>광고 정책 체크</h2>
        <p>
          광고 성과를 인위적으로 만들거나 사용자가 광고임을 오인하게 만드는
          패턴은 차단될 수 있어요.
        </p>
      </div>

      <div className="policy-grid">
        {safeResults.map(({ placement, violations }) => (
          <div key={placement.label} className="policy-card">
            <span>{placement.format}</span>
            <strong>{placement.label}</strong>
            <p>{placement.screen}</p>
            <em>{violations.length === 0 ? "위반 없음" : "검토 필요"}</em>
          </div>
        ))}
      </div>

      <div className="blocked-panel">
        <span>차단해야 하는 예시</span>
        <strong>광고 클릭 보상, CTA 주변 배너, 자동 refresh</strong>
        <ul>
          {blockedExample.map((violation) => (
            <li key={violation.code}>{violation.message}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EventLog({
  logs,
}: {
  logs: Array<{
    type: "info" | "success" | "warning" | "error";
    message: string;
  }>;
}) {
  if (logs.length === 0) {
    return (
      <div className="event-log empty">
        <span>이벤트 로그</span>
        <p>아직 수신한 이벤트가 없어요.</p>
      </div>
    );
  }

  return (
    <div className="event-log">
      <span>이벤트 로그</span>
      <ul>
        {logs.map((log, index) => (
          <li key={`${log.message}-${index}`} className={log.type}>
            {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [selectedTab, setSelectedTab] = useState<TabKey>("interstitial");

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Apps in Toss Monetization</p>
        <h1>인앱 광고 예제</h1>
        <p>
          전면형, 보상형, WebView 배너 광고를 테스트 ID로 호출하고 정책에 맞는
          배치 패턴을 확인해요.
        </p>
      </header>

      <nav className="tab-list" aria-label="광고 예제 탭">
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

      {selectedTab === "interstitial" && (
        <FullScreenAdPanel kind="interstitial" />
      )}
      {selectedTab === "rewarded" && <FullScreenAdPanel kind="rewarded" />}
      {selectedTab === "banner" && <BannerAdPanel />}
      {selectedTab === "policy" && <PolicyPanel />}
    </main>
  );
}

export default App;
