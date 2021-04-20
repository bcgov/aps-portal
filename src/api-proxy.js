
const express = require('express');
const pathModule = require('path');

const { createProxyMiddleware } = require('http-proxy-middleware');

class ApiProxyApp {
  constructor({ gwaApiUrl }) {
    this._gwaApiUrl = gwaApiUrl;
  }

  prepareMiddleware() {
    const app = express();
    const apiProxy = createProxyMiddleware({ 
        target: this._gwaApiUrl, 
        changeOrigin: true,
        pathRewrite: { '^/vapi/': '/v2/' },
        onProxyReq: (proxyReq, req) => { 
            proxyReq.setHeader('Accept', 'application/json')
            proxyReq.setHeader('Authorization', `Bearer ${req.header('x-forwarded-access-token')}`) },
        onError:(err, req, res, target) => {
            console.log(err)
            res.writeHead(500, {
              'Content-Type': 'text/plain',
            });
            res.end('error reaching api');
        }
    })
    app.all(/^\/vapi/, apiProxy)
    return app;
  }
}

module.exports = {
    ApiProxyApp,
};