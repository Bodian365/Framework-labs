import { buildApp } from "./app.js";

const start = async () => {
  const fastify = await buildApp();

  fastify.addHook("onClose", async (instance) => {
    instance.log.info("Server closed gracefully");
  });

  const gracefulShutdown = async (signal) => {
    fastify.log.info(`Received signal: ${signal}`);
    await fastify.close();
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  process.on("uncaughtException", (err) => {
    fastify.log.fatal({ err }, "Uncaught Exception detected");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    fastify.log.fatal({ reason }, "Unhandled Promise Rejection detected");
    process.exit(1);
  });

  try {
    await fastify.listen({
      port: fastify.config.PORT,
      host: fastify.config.HOST,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
