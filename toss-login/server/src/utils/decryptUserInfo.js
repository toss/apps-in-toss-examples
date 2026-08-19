const decryptUserData = require('./decryptUserData');
const { DECRYPTION_KEY_BASE64, AAD_STRING } = require('../../env.config');

/**
 * 사용자 정보 객체에 대해 복호화 적용
 * @param {object} userInfo - 암호화된 사용자 정보
 * @returns {object} 복호화된 사용자 정보 (원본 포함)
 */
function decryptUserInfo(userInfo) {
  // 토스 로그인 사용자 정보 중 개인정보 필드는 암호화되어 내려오므로 서버에서만 복호화해요.
  const fields = [
    'ci',
    'name',
    'phone',
    'gender',
    'nationality',
    'birthday',
    'email',
  ];

  const decrypted = {};

  for (const key of fields) {
    const value = userInfo?.[key];
    decrypted[key] =
      typeof value === 'string'
        ? decryptUserData(value, DECRYPTION_KEY_BASE64, AAD_STRING)
        : null;
  }

  return {
    ...userInfo,
    ...decrypted,
  };
}

module.exports = decryptUserInfo;
