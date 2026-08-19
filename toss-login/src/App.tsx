import { appLogin } from "@apps-in-toss/web-framework";
import { useMemo, useState } from "react";
import "./App.css";

type TokenResponse = {
  data?: {
    success?: {
      accessToken: string;
      refreshToken: string;
    };
  };
};

type GetUserInfoResponse = {
  data?: {
    success?: UserInfo;
  };
};

type UserInfo = {
  userKey: number;
  scope: string;
  agreedTerms: string[];
  policy: string;
  certTxId?: string;
  name: string | null;
  phone: string | null;
  birthday: string | null;
  ci: string | null;
  di: string | null;
  gender: string | null;
  nationality: string | null;
  email: string | null;
};

const serverBaseUrl =
  import.meta.env.VITE_SERVER_BASE_URL ?? "http://localhost:4000";

async function request<TResponse, TBody = unknown>(
  path: string,
  options: {
    method: "GET" | "POST";
    body?: TBody;
    accessToken?: string;
  },
) {
  const response = await fetch(`${serverBaseUrl}${path}`, {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      ...(options.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    body:
      options.method === "POST" ? JSON.stringify(options.body ?? {}) : undefined,
  });

  const data = (await response.json()) as TResponse;

  if (!response.ok) {
    throw new Error(`서버 요청에 실패했어요. status=${response.status}`);
  }

  return data;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "알 수 없는 문제가 발생했어요.";
}

function maskToken(token: string | null) {
  if (token == null) {
    return "없음";
  }

  if (token.length <= 18) {
    return token;
  }

  return `${token.slice(0, 10)}...${token.slice(-6)}`;
}

function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userKeyInput, setUserKeyInput] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notice, setNotice] = useState("토스 로그인을 시작해 주세요.");
  const [error, setError] = useState<string | null>(null);

  const userInfoSummary = useMemo(() => {
    if (userInfo == null) {
      return [];
    }

    return Object.entries(userInfo).filter(([, value]) => value != null);
  }, [userInfo]);

  const runAction = async (label: string, action: () => Promise<void>) => {
    try {
      setLoadingAction(label);
      setError(null);
      await action();
    } catch (error) {
      console.error(error);
      setError(getErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  // 토스 앱 로그인 화면을 열고, 반환받은 인가 코드를 서버로 보내 토큰을 발급받아요.
  const handleLogin = () => {
    runAction("login", async () => {
      const { authorizationCode, referrer } = await appLogin();
      const response = await request<
        TokenResponse,
        { authorizationCode: string; referrer: "DEFAULT" | "SANDBOX" }
      >("/get-access-token", {
        method: "POST",
        body: { authorizationCode, referrer },
      });

      const nextAccessToken = response.data?.success?.accessToken;
      const nextRefreshToken = response.data?.success?.refreshToken;

      if (nextAccessToken == null || nextRefreshToken == null) {
        throw new Error("토큰 발급 응답에서 토큰을 찾지 못했어요.");
      }

      setAccessToken(nextAccessToken);
      setRefreshToken(nextRefreshToken);
      setNotice("로그인에 성공했고 AccessToken과 RefreshToken을 받았어요.");
    });
  };

  // RefreshToken을 서버로 보내 AccessToken을 다시 발급받아요.
  const handleRefreshToken = () => {
    runAction("refresh", async () => {
      if (refreshToken == null) {
        throw new Error("RefreshToken이 없어요. 먼저 로그인해 주세요.");
      }

      const response = await request<TokenResponse, { refreshToken: string }>(
        "/refresh-token",
        {
          method: "POST",
          body: { refreshToken },
        },
      );
      const nextAccessToken = response.data?.success?.accessToken;

      if (nextAccessToken == null) {
        throw new Error("AccessToken 재발급 응답에서 토큰을 찾지 못했어요.");
      }

      setAccessToken(nextAccessToken);
      setNotice("AccessToken을 다시 발급받았어요.");
    });
  };

  // AccessToken을 Authorization 헤더에 담아 사용자 정보를 조회해요.
  const handleGetUserInfo = () => {
    runAction("userInfo", async () => {
      if (accessToken == null) {
        throw new Error("AccessToken이 없어요. 먼저 로그인해 주세요.");
      }

      const response = await request<GetUserInfoResponse>("/get-user-info", {
        method: "GET",
        accessToken,
      });
      const nextUserInfo = response.data?.success;

      if (nextUserInfo == null) {
        throw new Error("사용자 정보 응답을 찾지 못했어요.");
      }

      setUserInfo(nextUserInfo);
      setUserKeyInput(String(nextUserInfo.userKey));
      setNotice("사용자 정보를 불러왔어요.");
    });
  };

  // 현재 AccessToken을 서버로 전달해 해당 토큰의 로그인 상태를 해제해요.
  const handleLogoutByAccessToken = () => {
    runAction("logoutAccess", async () => {
      if (accessToken == null) {
        throw new Error("AccessToken이 없어요. 먼저 로그인해 주세요.");
      }

      await request<unknown, Record<string, never>>("/logout-by-access-token", {
        method: "POST",
        body: {},
        accessToken,
      });

      setAccessToken(null);
      setRefreshToken(null);
      setUserInfo(null);
      setNotice("AccessToken 기준으로 로그아웃했어요.");
    });
  };

  // 사용자 식별키(userKey)를 서버로 전달해 해당 사용자의 로그인 상태를 해제해요.
  const handleLogoutByUserKey = () => {
    runAction("logoutUserKey", async () => {
      const userKey = userKeyInput.trim();

      if (userKey.length === 0) {
        throw new Error("userKey를 입력해 주세요.");
      }

      await request<unknown, { userKey: string }>("/logout-by-user-key", {
        method: "POST",
        body: { userKey },
      });

      setAccessToken(null);
      setRefreshToken(null);
      setUserInfo(null);
      setNotice("userKey 기준으로 로그아웃했어요.");
    });
  };

  // 화면에 저장된 토큰과 사용자 정보만 초기화해요. 서버 세션은 변경하지 않아요.
  const handleClearState = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUserInfo(null);
    setUserKeyInput("");
    setError(null);
    setNotice("화면 상태를 초기화했어요.");
  };

  const isLoading = loadingAction != null;

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Apps in Toss WebView</p>
        <h1>토스 로그인</h1>
        <p className="hero-description">
          `appLogin`으로 인가 코드를 받고, 서버에서 토큰 교환과 사용자 정보
          조회를 처리하는 React + TypeScript 예제예요.
        </p>
      </header>

      <section className="status-panel" aria-live="polite">
        <div>
          <span className="status-label">상태</span>
          <strong>{notice}</strong>
        </div>
        {error != null ? <p className="error-message">{error}</p> : null}
      </section>

      <section className="section">
        <h2>로그인 플로우</h2>
        <div className="button-grid">
          <button type="button" onClick={handleLogin} disabled={isLoading}>
            토스 로그인
          </button>
          <button
            type="button"
            onClick={handleRefreshToken}
            disabled={isLoading || refreshToken == null}
          >
            AccessToken 재발급
          </button>
          <button
            type="button"
            onClick={handleGetUserInfo}
            disabled={isLoading || accessToken == null}
          >
            사용자 정보 조회
          </button>
        </div>
      </section>

      <section className="section">
        <h2>토큰</h2>
        <dl className="token-list">
          <div>
            <dt>AccessToken</dt>
            <dd>{maskToken(accessToken)}</dd>
          </div>
          <div>
            <dt>RefreshToken</dt>
            <dd>{maskToken(refreshToken)}</dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <h2>로그아웃</h2>
        <label className="input-field">
          <span>userKey</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="사용자 정보 조회 후 자동 입력돼요"
            value={userKeyInput}
            onChange={(event) => setUserKeyInput(event.target.value)}
          />
        </label>
        <div className="button-grid">
          <button
            type="button"
            onClick={handleLogoutByAccessToken}
            disabled={isLoading || accessToken == null}
          >
            AccessToken 로그아웃
          </button>
          <button type="button" onClick={handleLogoutByUserKey} disabled={isLoading}>
            userKey 로그아웃
          </button>
          <button type="button" className="secondary" onClick={handleClearState}>
            화면 초기화
          </button>
        </div>
      </section>

      <section className="section">
        <h2>사용자 정보</h2>
        {userInfoSummary.length > 0 ? (
          <dl className="user-info-list">
            {userInfoSummary.map(([key, value]) => (
              <div key={key}>
                <dt>{key}</dt>
                <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="empty-text">아직 조회한 사용자 정보가 없어요.</p>
        )}
      </section>
    </main>
  );
}

export default App;
