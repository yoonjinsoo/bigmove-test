const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.NODE_ENV === 'production' 
        ? 'https://bigmove-test-production.up.railway.app'
        : 'http://127.0.0.1:8000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('프록시 요청 시작:', {
          originalUrl: req.originalUrl,
          targetUrl: `http://127.0.0.1:8000${req.path.replace('/api', '')}`,
          headers: req.headers
        });
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log('프록시 응답 받음:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers
        });
      },
      onError: (err, req, res) => {
        console.error('프록시 에러 발생:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        
        if (!res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
          });
          res.end(JSON.stringify({ 
            error: '프록시 연결 실패',
            details: err.message 
          }));
        }
      },
      proxyTimeout: 10000,
      timeout: 10000
    })
  );
};
