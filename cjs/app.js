const fastify = require('fastify');
const apiRoutes = require('./routes/api.routes');

function buildApp() {
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        coerceTypes: true,
        allErrors: true,
        removeAdditional: true,
      },
    },
  });

  const config = require('./config/env');
  config.port = 9999;

  const errorHandler = require('./plugins/error-handler');
  app.register(errorHandler);

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(apiRoutes, { prefix: '/api' });

  return app;
}

module.exports = buildApp;
