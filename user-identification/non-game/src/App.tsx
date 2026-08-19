import { getAnonymousKey } from "@apps-in-toss/web-framework";
import { useState } from "react";
import "./App.css";

type AnonymousKeyResult =
  | {
      type: "HASH";
      hash: string;
    }
  | "INVALID_CATEGORY"
  | "ERROR"
  | undefined;

type StatusType = "idle" | "success" | "warning" | "error";

function getStatusMessage(result: AnonymousKeyResult) {
  if (result == null) {
    return {
      type: "warning" as const,
      title: "지원하지 않는 SDK 버전이에요.",
      description:
        "비게임 사용자 식별키는 @apps-in-toss/web-framework 3.x에서 사용할 수 있어요.",
    };
  }

  if (result === "INVALID_CATEGORY") {
    return {
      type: "error" as const,
      title: "비게임 카테고리 미니앱이 아니에요.",
      description:
        "getAnonymousKey는 비게임 카테고리로 등록된 미니앱에서만 호출할 수 있어요.",
    };
  }

  if (result === "ERROR") {
    return {
      type: "error" as const,
      title: "사용자 식별키를 가져오지 못했어요.",
      description: "잠시 후 다시 시도하거나 실행 환경을 확인해 주세요.",
    };
  }

  return {
    type: "success" as const,
    title: "비게임 사용자 식별키를 가져왔어요.",
    description:
      "이 hash는 현재 비게임 미니앱 안에서 같은 사용자에게 동일하게 반환돼요.",
  };
}

function maskHash(hash: string) {
  if (hash.length <= 18) {
    return hash;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

function App() {
  const [result, setResult] = useState<AnonymousKeyResult>(undefined);
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [title, setTitle] = useState("비게임 사용자 식별키를 조회해 주세요.");
  const [description, setDescription] = useState(
    "서버 연동이나 사용자 동의 화면 없이 비게임 미니앱 안에서 사용할 수 있는 사용자 식별자를 받아요.",
  );
  const [isLoading, setIsLoading] = useState(false);

  const hash = typeof result === "object" ? result.hash : null;

  // 비게임 미니앱 전용 사용자 식별키를 조회해요.
  // 반환된 hash는 회원가입 없이도 사용자별 데이터, 설정, 진행 상태를 구분하는 내부 키로 사용할 수 있어요.
  const handleGetAnonymousKey = async () => {
    try {
      setIsLoading(true);
      const nextResult = await getAnonymousKey();
      const nextStatus = getStatusMessage(nextResult);

      setResult(nextResult);
      setStatusType(nextStatus.type);
      setTitle(nextStatus.title);
      setDescription(nextStatus.description);
    } catch (error) {
      console.error(error);
      setResult("ERROR");
      setStatusType("error");
      setTitle("사용자 식별키 조회 중 예외가 발생했어요.");
      setDescription("콘솔 로그와 앱인토스 실행 환경을 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 화면에 표시된 조회 결과만 초기화해요. 서버나 토스 사용자 상태는 변경하지 않아요.
  const handleClear = () => {
    setResult(undefined);
    setStatusType("idle");
    setTitle("비게임 사용자 식별키를 조회해 주세요.");
    setDescription(
      "서버 연동이나 사용자 동의 화면 없이 비게임 미니앱 안에서 사용할 수 있는 사용자 식별자를 받아요.",
    );
  };

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Non-Game Mini App</p>
        <h1>비게임 사용자 식별키</h1>
        <p className="hero-description">
          `getAnonymousKey`로 비게임 미니앱 전용 사용자 식별키를 가져오는
          예제예요.
        </p>
      </header>

      <section className={`status-panel ${statusType}`} aria-live="polite">
        <span>조회 상태</span>
        <strong>{title}</strong>
        <p>{description}</p>
      </section>

      <section className="section">
        <h2>식별키 조회</h2>
        <div className="button-group">
          <button
            type="button"
            onClick={handleGetAnonymousKey}
            disabled={isLoading}
          >
            {isLoading ? "조회 중..." : "비게임 사용자 식별키 가져오기"}
          </button>
          <button type="button" className="secondary" onClick={handleClear}>
            결과 초기화
          </button>
        </div>
      </section>

      <section className="section">
        <h2>조회 결과</h2>
        <dl className="result-list">
          <div>
            <dt>SDK 함수</dt>
            <dd>getAnonymousKey</dd>
          </div>
          <div>
            <dt>응답 타입</dt>
            <dd>{hash != null ? "HASH" : String(result ?? "없음")}</dd>
          </div>
          <div>
            <dt>사용자 hash</dt>
            <dd>{hash != null ? maskHash(hash) : "아직 조회 전이에요."}</dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <h2>사용 예시</h2>
        <ul className="usage-list">
          <li>사용자별 설정값 저장</li>
          <li>비회원 상태의 진행 데이터 관리</li>
          <li>내부 DB의 익명 사용자 레코드와 연결</li>
        </ul>
      </section>

      <section className="notice">
        <strong>주의사항</strong>
        <p>
          이 hash는 내부 사용자 식별용 키예요. 토스 서버 API 호출용 토큰이나
          인증 수단으로 사용하지 마세요.
        </p>
      </section>
    </main>
  );
}

export default App;
