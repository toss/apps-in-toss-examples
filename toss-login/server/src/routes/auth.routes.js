const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// 클라이언트가 appLogin()으로 받은 인가 코드를 AccessToken/RefreshToken으로 교환해요.
router.post('/get-access-token', authController.getAccessToken);

// RefreshToken을 사용해 만료되었거나 갱신이 필요한 AccessToken을 다시 발급해요.
router.post('/refresh-token', authController.refreshToken);

// AccessToken으로 토스 로그인 사용자 정보를 조회하고, 암호화된 필드는 서버에서 복호화해요.
router.get('/get-user-info', authController.getUserInfo);

// 현재 AccessToken 기준으로 사용자의 토스 로그인 연결을 해제해요.
router.post('/logout-by-access-token', authController.logoutByAccessToken);

// 사용자 식별키(userKey) 기준으로 사용자의 토스 로그인 연결을 해제해요.
router.post('/logout-by-user-key', authController.logoutByUserKey);

module.exports = router;
