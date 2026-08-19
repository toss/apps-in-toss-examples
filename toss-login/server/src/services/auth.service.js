const TLSClient = require('../clients/TLSClient');
const {
  CLIENT_CERT_PATH,
  CLIENT_KEY_PATH,
  AUTH_API_BASE,
} = require('../../env.config');

const client = new TLSClient(CLIENT_CERT_PATH, CLIENT_KEY_PATH);

// appLogin()에서 받은 인가 코드는 클라이언트에 오래 두지 않고 서버에서 토큰으로 교환해요.
exports.getAccessToken = async ({ authorizationCode, referrer }) => {
  return client.post(`${AUTH_API_BASE}/generate-token`, {
    authorizationCode,
    referrer,
  });
};

// AccessToken이 만료되었거나 재발급이 필요할 때 RefreshToken으로 새 AccessToken을 받아요.
exports.refreshAccessToken = async ({ refreshToken }) => {
  return client.post(`${AUTH_API_BASE}/refresh-token`, {
    refreshToken: refreshToken,
  });
};

// 사용자 정보 API는 AccessToken이 필요하고, 응답의 개인정보 필드는 컨트롤러에서 복호화해요.
exports.getUserInfo = async (accessToken) => {
  return client.get(`${AUTH_API_BASE}/login-me`, {
    'Content-Type': 'application/json',
    Authorization: accessToken,
  });
};

// 현재 AccessToken 하나에 연결된 토스 로그인 권한을 해제해요.
exports.logoutByAccessToken = async (accessToken) => {
  return client.post(
    `${AUTH_API_BASE}/access/remove-by-access-token`,
    {},
    { Authorization: accessToken }
  );
};

// 특정 userKey에 연결된 토스 로그인 권한을 해제해요.
exports.logoutByUserKey = async ({ userKey }) => {
  return client.post(`${AUTH_API_BASE}/access/remove-by-user-key`, { userKey });
};
