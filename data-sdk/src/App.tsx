import { getConsentedUserData } from "@apps-in-toss/web-framework";
import { useMemo, useState } from "react";
import "./App.css";

type ConsentedUserDataKey =
  | "USER_NAME"
  | "USER_GENDER"
  | "USER_NATIONALITY"
  | "USER_BIRTHDAY"
  | "USER_PHONE"
  | "USER_ADDRESS"
  | "USER_EMAIL"
  | "USER_CONSUMPTION_HISTORY";

type ConsentedUserData = Partial<Record<ConsentedUserDataKey, string | null>>;

type GetConsentedUserDataErrorCode =
  | "USER_DECLINED"
  | "UNAVAILABLE"
  | "TERMS_NOT_SET"
  | "INVALID_REQUEST"
  | "CANCELED"
  | "CONSENTED_USER_DATA_AGREEMENT_FAILED"
  | "CONSENTED_USER_DATA_INVALID_DATA";

type StatusType = "idle" | "success" | "warning" | "error";

const dataFields: Array<{
  key: ConsentedUserDataKey;
  label: string;
  description: string;
}> = [
  {
    key: "USER_NAME",
    label: "이름",
    description: "사용자 이름",
  },
  {
    key: "USER_GENDER",
    label: "성별",
    description: "사용자 성별",
  },
  {
    key: "USER_NATIONALITY",
    label: "국적",
    description: "내국인/외국인 여부",
  },
  {
    key: "USER_BIRTHDAY",
    label: "생년월일",
    description: "사용자 생년월일",
  },
  {
    key: "USER_PHONE",
    label: "휴대전화",
    description: "사용자 휴대전화번호",
  },
  {
    key: "USER_ADDRESS",
    label: "주소",
    description: "토스에 등록된 집 주소",
  },
  {
    key: "USER_EMAIL",
    label: "이메일",
    description: "토스에 등록된 이메일 주소",
  },
  {
    key: "USER_CONSUMPTION_HISTORY",
    label: "소비 이력",
    description: "콘솔에서 설정한 사용자 소비 이력 데이터",
  },
];

const errorMessages: Record<
  GetConsentedUserDataErrorCode,
  { title: string; description: string }
> = {
  USER_DECLINED: {
    title: "사용자가 동의를 거부했어요.",
    description:
      "재요청 옵션이 꺼져 있거나, 약관 웹뷰에서 사용자가 동의를 거부했어요.",
  },
  UNAVAILABLE: {
    title: "동의 여부를 판단할 수 없어요.",
    description: "서버가 현재 사용자의 동의 상태를 확인하지 못했어요.",
  },
  TERMS_NOT_SET: {
    title: "사용자 데이터 제공 동의문이 없어요.",
    description: "앱인토스 콘솔에서 사용자 정보 불러오기를 먼저 등록해 주세요.",
  },
  INVALID_REQUEST: {
    title: "요청 값이 올바르지 않아요.",
    description:
      "consentedUserDataKey가 비어 있거나, 약관 URL이 HTTPS 회사 도메인이 아닐 수 있어요.",
  },
  CANCELED: {
    title: "약관 웹뷰가 닫혔어요.",
    description: "사용자 동의 결과를 받기 전에 약관 웹뷰가 종료됐어요.",
  },
  CONSENTED_USER_DATA_AGREEMENT_FAILED: {
    title: "약관 웹뷰 처리 중 오류가 발생했어요.",
    description: "동의 웹뷰를 표시하거나 처리하는 과정에서 문제가 발생했어요.",
  },
  CONSENTED_USER_DATA_INVALID_DATA: {
    title: "동의 데이터 응답이 올바르지 않아요.",
    description: "동의 성공 후 사용자 데이터 조회 결과가 유효하지 않아요.",
  },
};

function getErrorCode(error: unknown) {
  if (typeof error !== "object" || error == null) {
    return null;
  }

  const candidate = error as Record<string, unknown>;
  const code = candidate.code ?? candidate.errorCode ?? candidate.message;

  return typeof code === "string" && code in errorMessages
    ? (code as GetConsentedUserDataErrorCode)
    : null;
}

function formatValue(value: string | null | undefined) {
  if (value === null) {
    return "null";
  }

  if (value === undefined || value.length === 0) {
    return "없음";
  }

  return value;
}

function App() {
  const [consentedUserDataKey, setConsentedUserDataKey] =
    useState("cud_delivery");
  const [
    shouldRequestAgreementWhenUserDeclined,
    setShouldRequestAgreementWhenUserDeclined,
  ] = useState(false);
  const [userData, setUserData] = useState<ConsentedUserData | null>(null);
  const [statusType, setStatusType] = useState<StatusType>("idle");
  const [title, setTitle] = useState("사용자 동의 데이터를 조회해 주세요.");
  const [description, setDescription] = useState(
    "콘솔에 등록한 consentedUserDataKey를 입력한 뒤 데이터를 요청해요.",
  );
  const [isLoading, setIsLoading] = useState(false);

  const returnedFields = useMemo(() => {
    if (userData == null) {
      return [];
    }

    return dataFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(userData, field.key),
    );
  }, [userData]);

  // 콘솔에 등록한 consentedUserDataKey로 사용자 동의 기반 데이터를 요청해요.
  // 필요한 경우 SDK가 약관 웹뷰를 열고, 동의가 완료되면 서버에서 조회한 데이터를 반환해요.
  const handleGetConsentedUserData = async () => {
    const trimmedKey = consentedUserDataKey.trim();

    if (trimmedKey.length === 0) {
      setStatusType("error");
      setTitle("consentedUserDataKey가 필요해요.");
      setDescription("앱인토스 콘솔에서 등록한 key 값을 입력해 주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setStatusType("idle");
      setTitle("사용자 동의 데이터를 요청하고 있어요.");
      setDescription("동의가 필요하면 토스앱에서 약관 웹뷰가 열릴 수 있어요.");

      const data = await getConsentedUserData({
        consentedUserDataKey: trimmedKey,
        shouldRequestAgreementWhenUserDeclined,
      });

      if (data == null) {
        setUserData(null);
        setStatusType("warning");
        setTitle("지원하지 않는 토스앱 버전이에요.");
        setDescription(
          "getConsentedUserData는 토스앱 5.264.0 이상에서 사용할 수 있어요.",
        );
        return;
      }

      setUserData(data);
      setStatusType("success");
      setTitle("사용자 동의 데이터를 가져왔어요.");
      setDescription(
        "응답에는 콘솔에서 설정하고 사용자가 동의한 데이터 항목만 포함돼요.",
      );
    } catch (error) {
      console.error(error);

      const errorCode = getErrorCode(error);
      const errorMessage = errorCode != null ? errorMessages[errorCode] : null;

      setUserData(null);
      setStatusType("error");
      setTitle(errorMessage?.title ?? "사용자 동의 데이터 조회에 실패했어요.");
      setDescription(
        errorMessage?.description ??
          "콘솔 설정, consentedUserDataKey, 실행 환경을 확인해 주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 화면에 표시된 조회 결과만 초기화해요. 사용자 동의 상태나 콘솔 설정은 변경하지 않아요.
  const handleClear = () => {
    setUserData(null);
    setStatusType("idle");
    setTitle("사용자 동의 데이터를 조회해 주세요.");
    setDescription(
      "콘솔에 등록한 consentedUserDataKey를 입력한 뒤 데이터를 요청해요.",
    );
  };

  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Consented User Data</p>
        <h1>사용자 정보</h1>
        <p className="hero-description">
          `getConsentedUserData`로 사용자 동의 기반 데이터를 요청하고 응답을
          확인하는 예제예요.
        </p>
      </header>

      <section className={`status-panel ${statusType}`} aria-live="polite">
        <span>조회 상태</span>
        <strong>{title}</strong>
        <p>{description}</p>
      </section>

      <section className="section">
        <h2>요청 옵션</h2>
        <label className="input-field">
          <span>consentedUserDataKey</span>
          <input
            type="text"
            placeholder="예: cud_delivery"
            value={consentedUserDataKey}
            onChange={(event) => setConsentedUserDataKey(event.target.value)}
          />
        </label>
        <label className="toggle-field">
          <input
            type="checkbox"
            checked={shouldRequestAgreementWhenUserDeclined}
            onChange={(event) =>
              setShouldRequestAgreementWhenUserDeclined(event.target.checked)
            }
          />
          <span>거부 상태에서도 약관 웹뷰 다시 요청하기</span>
        </label>
        <div className="button-group">
          <button
            type="button"
            onClick={handleGetConsentedUserData}
            disabled={isLoading}
          >
            {isLoading ? "조회 중..." : "사용자 정보 가져오기"}
          </button>
          <button type="button" className="secondary" onClick={handleClear}>
            결과 초기화
          </button>
        </div>
      </section>

      <section className="section">
        <h2>조회 결과</h2>
        {returnedFields.length > 0 ? (
          <dl className="data-list">
            {returnedFields.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>
                  <strong>{formatValue(userData?.[field.key])}</strong>
                  <span>{field.key}</span>
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="empty-text">아직 반환된 사용자 데이터가 없어요.</p>
        )}
      </section>

      <section className="section">
        <h2>요청 가능한 데이터</h2>
        <ul className="field-list">
          {dataFields.map((field) => (
            <li key={field.key}>
              <strong>{field.key}</strong>
              <span>{field.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="notice">
        <strong>주의사항</strong>
        <p>
          `USER_ADDRESS`, `USER_EMAIL`은 사용자가 토스에 등록하지 않았으면
          `null`로 전달될 수 있어요. 실제 서비스에서는 null 처리를 반드시 해
          주세요.
        </p>
      </section>
    </main>
  );
}

export default App;
