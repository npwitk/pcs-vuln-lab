// Dev-only (CRA): mirrors vercel.json's /media/previews rewrite, so the 3D
// preview's textures load same-origin locally too. WebGL can't use images
// from the CDN/GCS bucket directly: they send no CORS headers. The package.json
// "proxy" (API) still applies alongside this.
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/media/previews',
    createProxyMiddleware({
      target: 'https://cdn.cheatsheets.npwitk.com',
      changeOrigin: true,
      pathRewrite: { '^/media/previews': '/previews' },
    })
  );
};
