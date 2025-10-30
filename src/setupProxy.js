// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Use um prefixo para o proxy, por exemplo, '/api'
    createProxyMiddleware({
      target: 'https://api.themoviedb.org', // URL base da API
      changeOrigin: true,
      pathRewrite: { // Opcional: reescreve o caminho removendo o '/api' antes de enviar
        '^/api': '', 
      },
      // Adicione esta linha se você tiver um problema com o host:
      // secure: false, 
    })
  );
};