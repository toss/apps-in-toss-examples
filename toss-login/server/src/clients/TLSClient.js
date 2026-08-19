const https = require('https');
const fs = require('fs');
const path = require('path');

class TLSClient {
  constructor(certPath, keyPath) {
    const resolvedCertPath = path.resolve(__dirname, '..', '..', certPath);
    const resolvedKeyPath = path.resolve(__dirname, '..', '..', keyPath);

    // 앱인토스 파트너 API는 mTLS 인증이 필요하므로 서버에서 인증서와 키를 로드해요.
    this.options = {
      cert: fs.readFileSync(resolvedCertPath),
      key: fs.readFileSync(resolvedKeyPath),
      rejectUnauthorized: true,
    };
  }

  makeRequest(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);

      // 모든 토스 로그인 API 요청은 HTTPS + mTLS 옵션을 포함해 서버에서 직접 호출해요.
      const requestOptions = {
        ...this.options,
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...headers,
        },
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data,
          });
        });
      });

      req.on('error', (error) => reject(error));

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async get(url, headers = {}) {
    return this.makeRequest(url, 'GET', null, headers);
  }

  async post(url, data, headers = {}) {
    return this.makeRequest(url, 'POST', data, headers);
  }
}

module.exports = TLSClient;
