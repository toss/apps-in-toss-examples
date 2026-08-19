import {
  fetchAlbumPhotos,
  fetchContacts,
  getClipboardText,
  getCurrentLocation,
  openCamera,
  setClipboardText,
  startUpdateLocation,
} from "@apps-in-toss/web-framework";
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type PermissionStatus = "notDetermined" | "denied" | "allowed";
type PermissionResult = PermissionStatus | "확인 전";
type ImageResult = Awaited<ReturnType<typeof openCamera>>;
type AlbumResult = Awaited<ReturnType<typeof fetchAlbumPhotos>>;
type ContactsResult = Awaited<ReturnType<typeof fetchContacts>>;
type ContactItem = ContactsResult["result"][number];
type LocationResult = Awaited<ReturnType<typeof getCurrentLocation>>;
type StopLocationWatcher = ReturnType<typeof startUpdateLocation>;

const IMAGE_OPTIONS = {
  base64: true,
  maxWidth: 720,
};

const CONTACT_PAGE_SIZE = 10;
const BALANCED_LOCATION_ACCURACY = 3;

const formatImageUri = (image?: ImageResult | null) => {
  if (image == null) {
    return "";
  }

  // base64 옵션을 true로 사용하면 dataUri에 prefix가 없어서 img 태그에 넣기 전에 보정해요.
  return IMAGE_OPTIONS.base64
    ? `data:image/jpeg;base64,${image.dataUri}`
    : image.dataUri;
};

const formatErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했어요.";
};

function App() {
  const [cameraPermission, setCameraPermission] =
    useState<PermissionResult>("확인 전");
  const [albumPermission, setAlbumPermission] =
    useState<PermissionResult>("확인 전");
  const [clipboardReadPermission, setClipboardReadPermission] =
    useState<PermissionResult>("확인 전");
  const [clipboardWritePermission, setClipboardWritePermission] =
    useState<PermissionResult>("확인 전");
  const [contactsPermission, setContactsPermission] =
    useState<PermissionResult>("확인 전");
  const [locationPermission, setLocationPermission] =
    useState<PermissionResult>("확인 전");

  const [cameraImage, setCameraImage] = useState<ImageResult | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumResult>([]);
  const [clipboardText, setClipboardTextState] = useState("");
  const [copyText, setCopyText] = useState("앱인토스 클립보드 예제");
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [contactsNextOffset, setContactsNextOffset] = useState<number | null>(
    0,
  );
  const [contactQuery, setContactQuery] = useState("");
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [liveLocation, setLiveLocation] = useState<LocationResult | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [lastMessage, setLastMessage] = useState("기능을 실행하면 결과가 여기에 표시돼요.");
  const stopLocationWatcherRef = useRef<StopLocationWatcher | null>(null);

  const contactFetchDone = contactsNextOffset == null;
  const cameraImageUri = useMemo(() => formatImageUri(cameraImage), [cameraImage]);

  useEffect(() => {
    return () => {
      stopLocationWatcherRef.current?.();
    };
  }, []);

  const handleError = (label: string, error: unknown) => {
    const message = `${label}: ${formatErrorMessage(error)}`;
    setLastMessage(message);
    console.error(message, error);
  };

  // 카메라 접근 권한의 현재 상태를 확인해요.
  const checkCameraPermission = async () => {
    try {
      const permission = await openCamera.getPermission();
      setCameraPermission(permission);
      setLastMessage(`카메라 권한 상태: ${permission}`);
    } catch (error) {
      handleError("카메라 권한 확인 실패", error);
    }
  };

  // 카메라 접근 권한 요청 다이얼로그를 열어요.
  const requestCameraPermission = async () => {
    try {
      const permission = await openCamera.openPermissionDialog();
      setCameraPermission(permission);
      setLastMessage(`카메라 권한 요청 결과: ${permission}`);
    } catch (error) {
      handleError("카메라 권한 요청 실패", error);
    }
  };

  // 카메라를 열고 촬영한 이미지를 base64 문자열로 받아 화면에 표시해요.
  const takePhoto = async () => {
    try {
      const image = await openCamera(IMAGE_OPTIONS);
      setCameraImage(image);
      setLastMessage("카메라 촬영 결과를 화면에 표시했어요.");
    } catch (error) {
      handleError("카메라 실행 실패", error);
    }
  };

  // 앨범 사진 읽기 권한의 현재 상태를 확인해요.
  const checkAlbumPermission = async () => {
    try {
      const permission = await fetchAlbumPhotos.getPermission();
      setAlbumPermission(permission);
      setLastMessage(`앨범 권한 상태: ${permission}`);
    } catch (error) {
      handleError("앨범 권한 확인 실패", error);
    }
  };

  // 앨범 사진 읽기 권한 요청 다이얼로그를 열어요.
  const requestAlbumPermission = async () => {
    try {
      const permission = await fetchAlbumPhotos.openPermissionDialog();
      setAlbumPermission(permission);
      setLastMessage(`앨범 권한 요청 결과: ${permission}`);
    } catch (error) {
      handleError("앨범 권한 요청 실패", error);
    }
  };

  // 앨범에서 최대 4개의 이미지를 가져와 미리보기 그리드에 표시해요.
  const loadAlbumPhotos = async () => {
    try {
      const photos = await fetchAlbumPhotos({
        ...IMAGE_OPTIONS,
        maxCount: 4,
      });
      setAlbumPhotos(photos);
      setLastMessage(`앨범에서 사진 ${photos.length}개를 가져왔어요.`);
    } catch (error) {
      handleError("앨범 사진 조회 실패", error);
    }
  };

  // 클립보드 읽기 권한의 현재 상태를 확인해요.
  const checkClipboardReadPermission = async () => {
    try {
      const permission = await getClipboardText.getPermission();
      setClipboardReadPermission(permission);
      setLastMessage(`클립보드 읽기 권한 상태: ${permission}`);
    } catch (error) {
      handleError("클립보드 읽기 권한 확인 실패", error);
    }
  };

  // 클립보드 읽기 권한 요청 다이얼로그를 열어요.
  const requestClipboardReadPermission = async () => {
    try {
      const permission = await getClipboardText.openPermissionDialog();
      setClipboardReadPermission(permission);
      setLastMessage(`클립보드 읽기 권한 요청 결과: ${permission}`);
    } catch (error) {
      handleError("클립보드 읽기 권한 요청 실패", error);
    }
  };

  // 클립보드에 저장된 텍스트를 읽어 결과 영역에 표시해요.
  const readClipboard = async () => {
    try {
      const text = await getClipboardText();
      setClipboardTextState(text || "클립보드에 텍스트가 없어요.");
      setLastMessage("클립보드 텍스트를 읽었어요.");
    } catch (error) {
      handleError("클립보드 읽기 실패", error);
    }
  };

  // 클립보드 쓰기 권한의 현재 상태를 확인해요.
  const checkClipboardWritePermission = async () => {
    try {
      const permission = await setClipboardText.getPermission();
      setClipboardWritePermission(permission);
      setLastMessage(`클립보드 쓰기 권한 상태: ${permission}`);
    } catch (error) {
      handleError("클립보드 쓰기 권한 확인 실패", error);
    }
  };

  // 클립보드 쓰기 권한 요청 다이얼로그를 열어요.
  const requestClipboardWritePermission = async () => {
    try {
      const permission = await setClipboardText.openPermissionDialog();
      setClipboardWritePermission(permission);
      setLastMessage(`클립보드 쓰기 권한 요청 결과: ${permission}`);
    } catch (error) {
      handleError("클립보드 쓰기 권한 요청 실패", error);
    }
  };

  // 입력 필드의 텍스트를 클립보드에 복사해요.
  const writeClipboard = async () => {
    try {
      await setClipboardText(copyText);
      setLastMessage("입력한 텍스트를 클립보드에 복사했어요.");
    } catch (error) {
      handleError("클립보드 쓰기 실패", error);
    }
  };

  // 연락처 읽기 권한의 현재 상태를 확인해요.
  const checkContactsPermission = async () => {
    try {
      const permission = await fetchContacts.getPermission();
      setContactsPermission(permission);
      setLastMessage(`연락처 권한 상태: ${permission}`);
    } catch (error) {
      handleError("연락처 권한 확인 실패", error);
    }
  };

  // 연락처 읽기 권한 요청 다이얼로그를 열어요.
  const requestContactsPermission = async () => {
    try {
      const permission = await fetchContacts.openPermissionDialog();
      setContactsPermission(permission);
      setLastMessage(`연락처 권한 요청 결과: ${permission}`);
    } catch (error) {
      handleError("연락처 권한 요청 실패", error);
    }
  };

  // nextOffset을 사용해 연락처를 페이지 단위로 이어서 가져와요.
  const loadNextContacts = async () => {
    try {
      if (contactFetchDone) {
        setLastMessage("더 가져올 연락처가 없어요.");
        return;
      }

      const response = await fetchContacts({
        size: CONTACT_PAGE_SIZE,
        offset: contactsNextOffset,
        query: contactQuery.trim()
          ? {
              contains: contactQuery.trim(),
            }
          : undefined,
      });

      setContacts((prev) => [...prev, ...response.result]);
      setContactsNextOffset(response.nextOffset);
      setLastMessage(`연락처 ${response.result.length}개를 가져왔어요.`);
    } catch (error) {
      handleError("연락처 조회 실패", error);
    }
  };

  // 검색어 변경이나 재조회 전에 연락처 페이지네이션 상태를 초기화해요.
  const resetContacts = () => {
    setContacts([]);
    setContactsNextOffset(0);
    setLastMessage("연락처 조회 상태를 초기화했어요.");
  };

  // 위치 정보 접근 권한의 현재 상태를 확인해요.
  const checkLocationPermission = async () => {
    try {
      const permission = await getCurrentLocation.getPermission();
      setLocationPermission(permission);
      setLastMessage(`위치 권한 상태: ${permission}`);
    } catch (error) {
      handleError("위치 권한 확인 실패", error);
    }
  };

  // 위치 정보 접근 권한 요청 다이얼로그를 열어요.
  const requestLocationPermission = async () => {
    try {
      const permission = await getCurrentLocation.openPermissionDialog();
      setLocationPermission(permission);
      setLastMessage(`위치 권한 요청 결과: ${permission}`);
    } catch (error) {
      handleError("위치 권한 요청 실패", error);
    }
  };

  // 현재 위치를 한 번 조회해 위도, 경도, 정확도, 갱신 시각을 표시해요.
  const loadCurrentLocation = async () => {
    try {
      // Accuracy.Balanced 값(3)을 사용해 배터리와 정확도 사이의 균형을 맞춰요.
      const currentLocation = await getCurrentLocation({
        accuracy: BALANCED_LOCATION_ACCURACY,
      });
      setLocation(currentLocation);
      setLastMessage("현재 위치 정보를 가져왔어요.");
    } catch (error) {
      handleError("현재 위치 조회 실패", error);
    }
  };

  // 실시간 위치 감지를 시작하고, 위치가 바뀔 때마다 onEvent 콜백으로 상태를 갱신해요.
  const startWatchingLocation = () => {
    if (stopLocationWatcherRef.current != null) {
      setLastMessage("이미 실시간 위치 감지를 실행 중이에요.");
      return;
    }

    const stopWatching = startUpdateLocation({
      options: {
        // Accuracy.Balanced 값(3)을 사용해 배터리와 정확도 사이의 균형을 맞춰요.
        accuracy: BALANCED_LOCATION_ACCURACY,
        timeInterval: 3000,
        distanceInterval: 10,
      },
      onEvent: (updatedLocation) => {
        setLiveLocation(updatedLocation);
        setLastMessage("실시간 위치 정보가 업데이트됐어요.");
      },
      onError: (error) => {
        stopWatchingLocation();
        handleError("실시간 위치 감지 실패", error);
      },
    });

    stopLocationWatcherRef.current = stopWatching;
    setIsWatchingLocation(true);
    setLastMessage("실시간 위치 감지를 시작했어요.");
  };

  // startUpdateLocation이 반환한 정리 함수를 호출해 위치 감지를 중지해요.
  const stopWatchingLocation = () => {
    stopLocationWatcherRef.current?.();
    stopLocationWatcherRef.current = null;
    setIsWatchingLocation(false);
    setLastMessage("실시간 위치 감지를 중지했어요.");
  };

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">Apps in Toss Web Framework</p>
        <h1>Device APIs</h1>
        <p>
          권한이 필요한 카메라, 앨범, 클립보드, 연락처, 위치 API를 한
          화면에서 호출해 보는 예제예요.
        </p>
      </header>

      <section className="status-panel" aria-live="polite">
        <span className="status-label">최근 실행 결과</span>
        <strong>{lastMessage}</strong>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>카메라</h2>
            <p>카메라 권한을 확인하고 촬영한 이미지를 표시해요.</p>
          </div>
          <PermissionBadge status={cameraPermission} />
        </div>

        <ActionGrid
          actions={[
            { label: "권한 확인", onClick: checkCameraPermission },
            { label: "권한 요청", onClick: requestCameraPermission },
            { label: "사진 촬영", onClick: takePhoto, primary: true },
          ]}
        />

        <div className="preview-box image-preview">
          {cameraImageUri ? (
            <img src={cameraImageUri} alt="카메라로 촬영한 이미지" />
          ) : (
            <span>촬영한 사진이 없어요.</span>
          )}
        </div>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>앨범</h2>
            <p>사진첩 읽기 권한을 확인하고 앨범 이미지를 가져와요.</p>
          </div>
          <PermissionBadge status={albumPermission} />
        </div>

        <ActionGrid
          actions={[
            { label: "권한 확인", onClick: checkAlbumPermission },
            { label: "권한 요청", onClick: requestAlbumPermission },
            { label: "앨범 조회", onClick: loadAlbumPhotos, primary: true },
          ]}
        />

        <div className="album-grid">
          {albumPhotos.length > 0 ? (
            albumPhotos.map((photo) => (
              <img
                key={photo.id}
                src={formatImageUri(photo)}
                alt="앨범에서 가져온 이미지"
              />
            ))
          ) : (
            <span>가져온 앨범 사진이 없어요.</span>
          )}
        </div>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>클립보드</h2>
            <p>클립보드 읽기와 쓰기 권한을 각각 확인해요.</p>
          </div>
          <div className="badge-stack">
            <PermissionBadge label="읽기" status={clipboardReadPermission} />
            <PermissionBadge label="쓰기" status={clipboardWritePermission} />
          </div>
        </div>

        <label className="field">
          <span>복사할 텍스트</span>
          <input
            value={copyText}
            onChange={(event) => setCopyText(event.target.value)}
            placeholder="클립보드에 복사할 텍스트"
          />
        </label>

        <div className="button-groups">
          <ActionGrid
            actions={[
              { label: "읽기 권한 확인", onClick: checkClipboardReadPermission },
              { label: "읽기 권한 요청", onClick: requestClipboardReadPermission },
              { label: "붙여넣기", onClick: readClipboard, primary: true },
            ]}
          />
          <ActionGrid
            actions={[
              { label: "쓰기 권한 확인", onClick: checkClipboardWritePermission },
              { label: "쓰기 권한 요청", onClick: requestClipboardWritePermission },
              { label: "복사하기", onClick: writeClipboard, primary: true },
            ]}
          />
        </div>

        <div className="result-box">
          <span className="result-label">읽어온 텍스트</span>
          <strong>{clipboardText || "아직 읽어온 텍스트가 없어요."}</strong>
        </div>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>연락처</h2>
            <p>연락처를 페이지 단위로 가져오고 이름 검색어를 적용해요.</p>
          </div>
          <PermissionBadge status={contactsPermission} />
        </div>

        <label className="field">
          <span>이름 검색어</span>
          <input
            value={contactQuery}
            onChange={(event) => {
              setContactQuery(event.target.value);
              setContacts([]);
              setContactsNextOffset(0);
            }}
            placeholder="예: 김"
          />
        </label>

        <ActionGrid
          actions={[
            { label: "권한 확인", onClick: checkContactsPermission },
            { label: "권한 요청", onClick: requestContactsPermission },
            {
              label: contactFetchDone ? "조회 완료" : "연락처 조회",
              onClick: loadNextContacts,
              primary: true,
              disabled: contactFetchDone,
            },
            { label: "초기화", onClick: resetContacts },
          ]}
        />

        <ul className="list-box">
          {contacts.length > 0 ? (
            contacts.map((contact, index) => (
              <li key={`${contact.phoneNumber}-${index}`}>
                <strong>{contact.name || "이름 없음"}</strong>
                <span>{contact.phoneNumber}</span>
              </li>
            ))
          ) : (
            <li className="empty-row">가져온 연락처가 없어요.</li>
          )}
        </ul>
      </section>

      <section className="api-section">
        <div className="section-heading">
          <div>
            <h2>위치</h2>
            <p>현재 위치를 한 번 조회하거나 위치 변경을 실시간으로 감지해요.</p>
          </div>
          <PermissionBadge status={locationPermission} />
        </div>

        <ActionGrid
          actions={[
            { label: "권한 확인", onClick: checkLocationPermission },
            { label: "권한 요청", onClick: requestLocationPermission },
            { label: "현재 위치 조회", onClick: loadCurrentLocation, primary: true },
          ]}
        />

        <h3 className="subsection-title">현재 위치</h3>
        <div className="location-grid">
          <Metric label="위도" value={location?.coords.latitude} />
          <Metric label="경도" value={location?.coords.longitude} />
          <Metric label="정확도" value={location?.coords.accuracy} suffix="m" />
          <Metric
            label="갱신 시각"
            value={
              location
                ? new Date(location.timestamp).toLocaleTimeString("ko-KR")
                : undefined
            }
          />
        </div>

        <h3 className="subsection-title">실시간 위치</h3>
        <ActionGrid
          actions={[
            {
              label: isWatchingLocation ? "감지 중" : "실시간 감지 시작",
              onClick: startWatchingLocation,
              primary: true,
              disabled: isWatchingLocation,
            },
            {
              label: "실시간 감지 중지",
              onClick: stopWatchingLocation,
              disabled: !isWatchingLocation,
            },
          ]}
        />

        <div className="location-grid">
          <Metric label="상태" value={isWatchingLocation ? "감지 중" : "중지됨"} />
          <Metric label="위도" value={liveLocation?.coords.latitude} />
          <Metric label="경도" value={liveLocation?.coords.longitude} />
          <Metric label="정확도" value={liveLocation?.coords.accuracy} suffix="m" />
          <Metric label="고도" value={liveLocation?.coords.altitude} suffix="m" />
          <Metric label="방향" value={liveLocation?.coords.heading} suffix="°" />
          <Metric
            label="갱신 시각"
            value={
              liveLocation
                ? new Date(liveLocation.timestamp).toLocaleTimeString("ko-KR")
                : undefined
            }
          />
        </div>
      </section>
    </main>
  );
}

function PermissionBadge({
  label,
  status,
}: {
  label?: string;
  status: PermissionResult;
}) {
  return (
    <span className={`permission-badge permission-${status}`}>
      {label ? `${label}: ` : ""}
      {status}
    </span>
  );
}

function ActionGrid({
  actions,
}: {
  actions: Array<{
    label: string;
    onClick: () => void | Promise<void>;
    primary?: boolean;
    disabled?: boolean;
  }>;
}) {
  return (
    <div className="action-grid">
      {actions.map((action) => (
        <button
          key={action.label}
          className={action.primary ? "button button-primary" : "button"}
          type="button"
          disabled={action.disabled}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value?: string | number;
  suffix?: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>
        {value == null || value === "" ? "없음" : `${value}${suffix}`}
      </strong>
    </div>
  );
}

export default App;
