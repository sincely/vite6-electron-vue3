import errorHandler from './error.mjs';

process.env.COMPATIBILITY_DATE = new Date().toISOString();

export default defineNitroConfig({
  // 实验性 WebSocket 支持：dev/node 运行时会挂载 crossws 的 upgrade 通道，
  // 具体 hooks 见 plugins/websocket.mjs
  experimental: {
    websocket: true,
  },
  devErrorHandler: errorHandler,
  errorHandler: '~/error',
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers':
          'Accept, Authorization, Content-Length, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-CSRF-TOKEN, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': '*',
      },
    },
  },
});
