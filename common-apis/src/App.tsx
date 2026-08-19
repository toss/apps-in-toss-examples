import { Environment, File, Storage } from "@apps-in-toss/web-framework";
import { useMemo, useState } from "react";
import "./App.css";

type ResultStatus = "idle" | "success" | "error";

type ResultState = {
  status: ResultStatus;
  title: string;
  detail: string;
};

type StorageSnapshot = {
  key: string;
  value: string | null;
};

type EnvironmentSnapshot = {
  deviceId: string;
  groupId: string;
  environment: string;
  tossAppVersion: string;
  deploymentId: string;
  initialURL: string;
};

const STORAGE_KEY_PREFIX = "apps-in-toss:common-apis";

const SAMPLE_TEXT = [
  "Apps in Toss Common APIs",
  "이 파일은 File.saveBase64 예제에서 생성했어요.",
  `createdAt=${new Date().toISOString()}`,
].join("\n");

const SAMPLE_PDF_BASE64 =
  "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSPj4Kc3RyZWFtCkJUIAovRjEgMjQgVGYKNzIgNzIwIFRkCihBcHBzIGluIFRvc3MgQ29tbW9uIEFQSXMpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKMyAwIG9iago1NwplbmRvYmoKMSAwIG9iago8PC9UeXBlIC9QYWdlIC9QYXJlbnQgNCAwIFIgL1Jlc291cmNlcyA8PC9Gb250IDw8L0YxIDUgMCBSPj4+PiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgMiAwIFI+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYT4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUgL1BhZ2VzIC9LaWRzIFsxIDAgUl0gL0NvdW50IDE+PgplbmRvYmoKNiAwIG9iago8PC9UeXBlIC9DYXRhbG9nIC9QYWdlcyA0IDAgUj4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxMTkgMDAwMDAgbiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwOTggMDAwMDAgbiAKMDAwMDAwMDI3NSAwMDAwMCBuIAowMDAwMDAwMjA1IDAwMDAwIG4gCjAwMDAwMDAzMzQgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDcgL1Jvb3QgNiAwIFI+PgpzdGFydHhyZWYKMzgzCiUlRU9G";

const formatUnknownError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했어요.";
};

const formatJSON = (value: unknown) => JSON.stringify(value, null, 2);

const readSupportStatus = (isSupported: () => boolean) => {
  try {
    return isSupported();
  } catch {
    return false;
  }
};

const encodeTextToBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

function App() {
  const [storageKey, setStorageKey] = useState(`${STORAGE_KEY_PREFIX}:memo`);
  const [storageValue, setStorageValue] = useState("앱인토스 공통 API 예제");
  const [storageSnapshot, setStorageSnapshot] =
    useState<StorageSnapshot | null>(null);
  const [environmentSnapshot, setEnvironmentSnapshot] =
    useState<EnvironmentSnapshot | null>(null);
  const [networkStatus, setNetworkStatus] = useState<string>("확인 전");
  const [serverTime, setServerTime] = useState<string>("확인 전");
  const [result, setResult] = useState<ResultState>({
    status: "idle",
    title: "대기 중",
    detail: "버튼을 누르면 API 호출 결과가 여기에 표시돼요.",
  });

  const fileSupportStatus = useMemo(
    () => ({
      saveBase64: readSupportStatus(File.saveBase64.isSupported),
      openPDFViewer: readSupportStatus(File.openPDFViewer.isSupported),
      getServerTime: readSupportStatus(Environment.getServerTime.isSupported),
    }),
    [],
  );

  const updateResult = (nextResult: ResultState) => {
    setResult(nextResult);
  };

  const handleError = (title: string, error: unknown) => {
    const detail = formatUnknownError(error);
    updateResult({ status: "error", title, detail });
    console.error(title, error);
  };

  /**
   * File.saveBase64 예제.
   *
   * - 앱에서 만든 텍스트/이미지/문서 데이터를 base64 문자열로 바꾼 뒤 기기에 저장할 때 사용해요.
   * - fileName에는 확장자를 포함해야 네이티브 저장 화면에서 파일 종류를 올바르게 표시할 수 있어요.
   * - 일반 브라우저가 아니라 토스 앱/샌드박스 앱 WebView에서 호출해야 실제 저장 동작을 확인할 수 있어요.
   */
  const saveTextFile = async () => {
    try {
      await File.saveBase64({
        data: encodeTextToBase64(SAMPLE_TEXT),
        fileName: "apps-in-toss-common-apis.txt",
        mimeType: "text/plain",
      });

      updateResult({
        status: "success",
        title: "텍스트 파일 저장 요청 완료",
        detail: "File.saveBase64로 txt 파일 저장을 요청했어요.",
      });
    } catch (error) {
      handleError("텍스트 파일 저장 실패", error);
    }
  };

  /**
   * File.openPDFViewer 예제.
   *
   * - 서버에서 받은 PDF 파일이나 앱에서 생성한 PDF를 base64로 전달하면 네이티브 PDF 뷰어를 열 수 있어요.
   * - 뷰어를 닫으면 Promise가 resolve되고, 반환값은 현재 SDK 기준으로 'CLOSE'예요.
   * - 지원 앱 버전이 필요한 API이므로 실제 서비스에서는 isSupported()로 버튼 노출 여부를 제어해 주세요.
   */
  const openPdfViewer = async () => {
    try {
      const closeReason = await File.openPDFViewer({
        data: SAMPLE_PDF_BASE64,
        filename: "apps-in-toss-common-apis.pdf",
      });

      updateResult({
        status: "success",
        title: "PDF 뷰어 닫힘",
        detail: `File.openPDFViewer 반환값: ${closeReason}`,
      });
    } catch (error) {
      handleError("PDF 뷰어 열기 실패", error);
    }
  };

  /**
   * Storage.setItem 예제.
   *
   * - 값은 문자열로 저장돼요. 객체를 저장해야 한다면 JSON.stringify로 직렬화하세요.
   * - 앱을 종료했다가 다시 들어와도 유지되는 로컬 저장소라서, 예제에서는 사용자가 입력한 메모를 저장해요.
   * - 사용자 식별이 필요한 중요한 서버 상태는 클라이언트 Storage만 믿지 말고 파트너 서버에 저장해야 해요.
   */
  const saveStorageItem = async () => {
    try {
      await Storage.setItem(storageKey, storageValue);
      setStorageSnapshot({ key: storageKey, value: storageValue });

      updateResult({
        status: "success",
        title: "Storage 저장 완료",
        detail: formatJSON({ key: storageKey, value: storageValue }),
      });
    } catch (error) {
      handleError("Storage 저장 실패", error);
    }
  };

  /**
   * Storage.getItem 예제.
   *
   * - 저장된 값이 없으면 null을 반환해요.
   * - 예제처럼 조회 결과를 null까지 그대로 보여주면, 저장 전/삭제 후 상태를 테스트하기 쉬워요.
   */
  const readStorageItem = async () => {
    try {
      const value = await Storage.getItem(storageKey);
      setStorageSnapshot({ key: storageKey, value });

      updateResult({
        status: "success",
        title: "Storage 조회 완료",
        detail: formatJSON({ key: storageKey, value }),
      });
    } catch (error) {
      handleError("Storage 조회 실패", error);
    }
  };

  /**
   * Storage.removeItem 예제.
   *
   * - 특정 키 하나만 삭제할 때 사용해요.
   * - 삭제 후 같은 키를 다시 조회하면 null이 반환되는지 확인할 수 있어요.
   */
  const removeStorageItem = async () => {
    try {
      await Storage.removeItem(storageKey);
      setStorageSnapshot({ key: storageKey, value: null });

      updateResult({
        status: "success",
        title: "Storage 삭제 완료",
        detail: formatJSON({ key: storageKey, value: null }),
      });
    } catch (error) {
      handleError("Storage 삭제 실패", error);
    }
  };

  /**
   * Storage.clearItems 예제.
   *
   * - 현재 미니앱 Storage에 저장된 모든 값을 삭제해요.
   * - 실제 앱에서는 로그아웃, 테스트 데이터 초기화처럼 명확한 사용자 의도가 있을 때만 연결하는 편이 안전해요.
   */
  const clearStorageItems = async () => {
    try {
      await Storage.clearItems();
      setStorageSnapshot(null);

      updateResult({
        status: "success",
        title: "Storage 전체 삭제 완료",
        detail: "Storage.clearItems로 저장된 값을 모두 삭제했어요.",
      });
    } catch (error) {
      handleError("Storage 전체 삭제 실패", error);
    }
  };

  /**
   * Environment 상수 예제.
   *
   * - deviceId, groupId, deploymentId처럼 호스트가 주입한 실행 환경 값을 읽어요.
   * - 이 값들은 Promise가 아니라 동기 getter라서 버튼을 누르는 시점에 스냅샷으로 모아 보여줘요.
   * - 일반 브라우저에서는 호스트 주입값이 없어서 실패할 수 있으니 샌드박스 앱에서 확인해 주세요.
   */
  const readEnvironmentSnapshot = () => {
    try {
      const snapshot = {
        deviceId: Environment.deviceId,
        groupId: Environment.groupId,
        environment: Environment.environment,
        tossAppVersion: Environment.tossAppVersion,
        deploymentId: Environment.deploymentId,
        initialURL: Environment.initialURL,
      };

      setEnvironmentSnapshot(snapshot);
      updateResult({
        status: "success",
        title: "실행 환경 조회 완료",
        detail: formatJSON(snapshot),
      });
    } catch (error) {
      handleError("실행 환경 조회 실패", error);
    }
  };

  /**
   * Environment.getNetworkStatus 예제.
   *
   * - 현재 연결 상태를 OFFLINE, WIFI, 2G, 3G, 4G, 5G, WWAN, UNKNOWN 중 하나로 반환해요.
   * - 네트워크 상태에 따라 큰 파일 다운로드나 결제 재시도 UX를 다르게 구성할 때 사용할 수 있어요.
   */
  const readNetworkStatus = async () => {
    try {
      const status = await Environment.getNetworkStatus();
      setNetworkStatus(status);

      updateResult({
        status: "success",
        title: "네트워크 상태 조회 완료",
        detail: `Environment.getNetworkStatus 반환값: ${status}`,
      });
    } catch (error) {
      handleError("네트워크 상태 조회 실패", error);
    }
  };

  /**
   * Environment.getServerTime 예제.
   *
   * - 디바이스 시간이 아니라 토스 앱 서버 시간을 Unix timestamp(ms)로 받아요.
   * - 출석 체크, 쿠폰 만료, 이벤트 종료처럼 사용자 기기 시간 조작에 영향을 받으면 안 되는 기능에 사용해요.
   */
  const readServerTime = async () => {
    try {
      const timestamp = await Environment.getServerTime();
      const formattedTime =
        timestamp == null
          ? "서버 시간이 반환되지 않았어요."
          : new Date(timestamp).toLocaleString("ko-KR");

      setServerTime(formattedTime);
      updateResult({
        status: "success",
        title: "서버 시간 조회 완료",
        detail: formatJSON({ timestamp, formattedTime }),
      });
    } catch (error) {
      handleError("서버 시간 조회 실패", error);
    }
  };

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">Apps in Toss WebView</p>
        <h1>공통 API 예제</h1>
        <p>
          파일 저장소와 네트워크, 실행 환경처럼 앱에서 공통으로 사용하는 API를
          한 화면에서 호출해요.
        </p>
      </header>

      <ResultPanel result={result} />

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>파일</h2>
            <p>
              Base64 데이터를 파일로 저장하거나 네이티브 PDF 뷰어에서 열어요.
            </p>
          </div>
        </div>

        <div className="support-grid">
          <SupportItem
            label="File.saveBase64"
            isSupported={fileSupportStatus.saveBase64}
          />
          <SupportItem
            label="File.openPDFViewer"
            isSupported={fileSupportStatus.openPDFViewer}
          />
        </div>

        <div className="action-grid">
          <button type="button" className="button" onClick={saveTextFile}>
            텍스트 파일 저장
          </button>
          <button type="button" className="button" onClick={openPdfViewer}>
            PDF 뷰어 열기
          </button>
        </div>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>저장소</h2>
            <p>문자열 값을 로컬 저장소에 저장하고 다시 읽거나 삭제해요.</p>
          </div>
        </div>

        <label className="field">
          <span>Storage key</span>
          <input
            value={storageKey}
            onChange={(event) => setStorageKey(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Storage value</span>
          <textarea
            rows={3}
            value={storageValue}
            onChange={(event) => setStorageValue(event.target.value)}
          />
        </label>

        <div className="action-grid four-columns">
          <button type="button" className="button" onClick={saveStorageItem}>
            저장
          </button>
          <button type="button" className="button" onClick={readStorageItem}>
            조회
          </button>
          <button type="button" className="button" onClick={removeStorageItem}>
            삭제
          </button>
          <button type="button" className="button" onClick={clearStorageItems}>
            전체 삭제
          </button>
        </div>

        <DataBox
          label="Storage snapshot"
          value={
            storageSnapshot == null
              ? "아직 조회한 값이 없어요."
              : formatJSON(storageSnapshot)
          }
        />
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>네트워크 & 환경</h2>
            <p>
              네트워크 상태, 서버 시간, 앱 실행 환경 정보를 확인해요.
            </p>
          </div>
        </div>

        <div className="support-grid">
          <SupportItem
            label="Environment.getServerTime"
            isSupported={fileSupportStatus.getServerTime}
          />
        </div>

        <div className="action-grid">
          <button
            type="button"
            className="button"
            onClick={readEnvironmentSnapshot}
          >
            실행 환경 조회
          </button>
          <button type="button" className="button" onClick={readNetworkStatus}>
            네트워크 상태 조회
          </button>
          <button type="button" className="button" onClick={readServerTime}>
            서버 시간 조회
          </button>
        </div>

        <div className="summary-grid">
          <SummaryItem label="네트워크" value={networkStatus} />
          <SummaryItem label="서버 시간" value={serverTime} />
        </div>

        <DataBox
          label="Environment snapshot"
          value={
            environmentSnapshot == null
              ? "아직 조회한 환경 정보가 없어요."
              : formatJSON(environmentSnapshot)
          }
        />
      </section>
    </main>
  );
}

function ResultPanel({ result }: { result: ResultState }) {
  return (
    <section className={`result-panel result-${result.status}`}>
      <span className="result-label">마지막 실행 결과</span>
      <strong>{result.title}</strong>
      <pre>{result.detail}</pre>
    </section>
  );
}

function SupportItem({
  label,
  isSupported,
}: {
  label: string;
  isSupported: boolean;
}) {
  return (
    <div className={isSupported ? "support supported" : "support unsupported"}>
      <span>{label}</span>
      <strong>{isSupported ? "지원" : "미지원"}</strong>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="data-box">
      <span>{label}</span>
      <pre>{value}</pre>
    </div>
  );
}

export default App;
