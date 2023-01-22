const { createProxyMiddleware } = require('http-proxy-middleware');
const proxy = {
    target: 'https://api.football-data.org',
    changeOrigin: true
}
module.exports = function(app) {
  app.use(
    '/v4',
    createProxyMiddleware(proxy)
  );
};