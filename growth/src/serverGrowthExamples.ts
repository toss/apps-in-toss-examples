/**
 * Apps in Toss 유입 & 성장 서버 API 예제
 *
 * 이 파일은 브라우저 앱에서 import하지 않는 참고용 서버 코드예요.
 * 스마트 발송과 서버형 프로모션 지급 API는 mTLS 인증서가 필요한 서버 간 통신이라
 * 미니앱 클라이언트에서 직접 호출하면 안 돼요.
 *
 * 실제 서비스에서는 아래 함수를 파트너사 백엔드에서 실행하고,
 * 클라이언트에는 "미션 완료", "알림 신청" 같은 비즈니스 API만 노출하세요.
 */

const APPS_IN_TOSS_API_BASE_URL = "https://apps-in-toss-api.toss.im";

type UserIdentifier =
  | {
      /** 토스 로그인으로 받은 userKey예요. */
      userKey: string;
      anonKey?: never;
    }
  | {
      /** 사용자 식별키 발급 API로 받은 hash 값이에요. */
      anonKey: string;
      userKey?: never;
    };

type AppsInTossSuccess<T> = {
  resultType: "SUCCESS";
  success: T;
};

type AppsInTossFailure = {
  resultType: "FAIL";
  error: {
    errorCode: string;
    reason: string;
  };
};

type AppsInTossResponse<T> = AppsInTossSuccess<T> | AppsInTossFailure;

type MessageSendResult = {
  msgCount: number;
  sentPushCount: number;
  sentInboxCount: number;
  sentSmsCount: number;
  sentAlimtalkCount: number;
  sentFriendtalkCount: number;
};

type PromotionKeyResult = {
  key: string;
};

function createUserIdentifierHeaders(identifier: UserIdentifier) {
  if ("userKey" in identifier) {
    return { "x-toss-user-key": identifier.userKey };
  }

  return { "x-anon-key": identifier.anonKey };
}

async function postToAppsInToss<T>({
  path,
  identifier,
  body,
}: {
  path: string;
  identifier?: UserIdentifier;
  body: unknown;
}) {
  /**
   * Node.js에서 mTLS를 적용하는 방법은 사용하는 HTTP 클라이언트에 따라 달라요.
   * fetch를 그대로 쓰는 대신, 실제 서버에서는 클라이언트 인증서와 개인키를
   * 포함한 HTTPS agent 또는 사내 표준 HTTP 클라이언트를 연결하세요.
   */
  const response = await fetch(`${APPS_IN_TOSS_API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(identifier ? createUserIdentifierHeaders(identifier) : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Apps in Toss API HTTP ${response.status}`);
  }

  return (await response.json()) as AppsInTossResponse<T>;
}

export async function sendSmartMessage({
  identifier,
  templateSetCode,
  context,
}: {
  identifier: UserIdentifier;
  /** 콘솔 > 스마트 발송 > 기능성 캠페인에서 확인하는 템플릿 코드예요. */
  templateSetCode: string;
  /** 템플릿 문구의 변수에 들어갈 값이에요. 예: { userName: "홍길동" } */
  context: Record<string, string | number | boolean>;
}) {
  return postToAppsInToss<MessageSendResult>({
    path: "/api-partner/v1/apps-in-toss/messenger/send-message",
    identifier,
    body: {
      templateSetCode,
      context,
    },
  });
}

export async function sendSmartMessageToMany({
  templateSetCode,
  contextList,
}: {
  templateSetCode: string;
  /** 대량 발송은 50건 이상, 최대 2,500건까지 사용하는 것을 권장해요. */
  contextList: Array<
    UserIdentifier & {
      context: Record<string, string | number | boolean>;
    }
  >;
}) {
  return postToAppsInToss<MessageSendResult>({
    path: "/api-partner/v1/apps-in-toss/messenger/send-bulk-message",
    body: {
      templateSetCode,
      contextList,
    },
  });
}

export async function sendSmartMessageForBundleTest({
  identifier,
  templateSetCode,
  deploymentId,
  context,
}: {
  identifier: UserIdentifier;
  templateSetCode: string;
  /** 콘솔에서 번들 업로드 후 발급되는 테스트용 deploymentId예요. */
  deploymentId: string;
  context: Record<string, string | number | boolean>;
}) {
  return postToAppsInToss<MessageSendResult>({
    path: "/api-partner/v1/apps-in-toss/messenger/send-test-message",
    identifier,
    body: {
      templateSetCode,
      deploymentId,
      context,
    },
  });
}

export async function createPromotionExecutionKey({
  identifier,
}: {
  identifier: UserIdentifier;
}) {
  /**
   * 서버형 프로모션은 먼저 지급 key를 발급받고, 그 key로 지급을 실행해요.
   * key 유효시간은 1시간이므로 발급 후 오래 저장하지 않는 편이 좋아요.
   */
  return postToAppsInToss<PromotionKeyResult>({
    path: "/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key",
    identifier,
    body: {},
  });
}

export async function executePromotionReward({
  identifier,
  promotionCode,
  key,
  amount,
}: {
  identifier: UserIdentifier;
  /** 콘솔에서 생성한 프로모션 코드예요. */
  promotionCode: string;
  /** createPromotionExecutionKey로 발급받은 지급 key예요. */
  key: string;
  amount: number;
}) {
  return postToAppsInToss<PromotionKeyResult>({
    path: "/api-partner/v1/apps-in-toss/promotion/execute-promotion",
    identifier,
    body: {
      promotionCode,
      key,
      amount,
    },
  });
}

export async function getPromotionExecutionResult({
  identifier,
  promotionCode,
  key,
}: {
  identifier: UserIdentifier;
  promotionCode: string;
  key: string;
}) {
  return postToAppsInToss<PromotionKeyResult>({
    path: "/api-partner/v1/apps-in-toss/promotion/execution-result",
    identifier,
    body: {
      promotionCode,
      key,
    },
  });
}
