const GetAccessTokenRequest = require('../dto/getAccessToken.dto');
const RefreshTokenRequest = require('../dto/refreshToken.dto');
const GetUserInfoRequest = require('../dto/getUserInfo.dto');
const LogoutByAccessTokenRequest = require('../dto/logoutByAccessToken.dto');
const LogoutByUserKeyRequest = require('../dto/logoutByUserKey.dto');
const authService = require('../services/auth.service');
const decryptUserInfo = require('../utils/decryptUserInfo');

exports.getAccessToken = async (req, res) => {
  try {
    // 클라이언트가 전달한 authorizationCode/referrer 형식을 검증한 뒤 토큰 교환 API를 호출해요.
    const requestData = new GetAccessTokenRequest(req.body);
    const response = await authService.getAccessToken(requestData);

    res.status(200).json({
      statusCode: response.statusCode,
      data: JSON.parse(response.data),
    });
  } catch (error) {
    console.error('getAccessToken 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    // RefreshToken은 서버에서 토스 로그인 API로 전달하고, 클라이언트에는 새 AccessToken만 응답해요.
    const requestData = new RefreshTokenRequest(req.body);
    const response = await authService.refreshAccessToken(requestData);

    res.status(200).json({
      statusCode: response.statusCode,
      data: JSON.parse(response.data),
    });
  } catch (error) {
    console.error('refreshToken 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    // AccessToken은 Authorization 헤더로 받고, 토스 API 응답의 개인정보 필드는 서버에서 복호화해요.
    const requestData = new GetUserInfoRequest(req.headers);
    const response = await authService.getUserInfo(requestData.authorization);

    const parsedData = JSON.parse(response.data);
    const decryptedUser = decryptUserInfo(parsedData.success);

    res.status(200).json({
      statusCode: response.statusCode,
      data: {
        ...parsedData,
        success: decryptedUser,
      },
    });
  } catch (error) {
    console.error('getUserInfo 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.logoutByAccessToken = async (req, res) => {
  try {
    // AccessToken 로그아웃은 Authorization 헤더에 담긴 토큰의 연결만 해제해요.
    const requestData = new LogoutByAccessTokenRequest(req.headers);
    const response = await authService.logoutByAccessToken(
      requestData.authorization
    );

    res.status(200).json({
      statusCode: response.statusCode,
      data: JSON.parse(response.data),
    });
  } catch (error) {
    console.error('logout 실패:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.logoutByUserKey = async (req, res) => {
  try {
    // userKey 로그아웃은 특정 사용자의 토스 로그인 연결을 서버에서 해제할 때 사용해요.
    const requestData = new LogoutByUserKeyRequest(req.body);
    const response = await authService.logoutByUserKey(requestData);

    res.status(200).json({
      statusCode: response.statusCode,
      data: JSON.parse(response.data),
    });
  } catch (error) {
    console.error('logoutByUserKey 실패:', error);
    res.status(500).json({ error: error.message });
  }
};
