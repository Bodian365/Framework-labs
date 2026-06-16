import Fastify from "fastify";
import fastifyEnv from "@fastify/env";
import sensible from "@fastify/sensible";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

import { envSchema } from "./schemas/env.schema.js";
import healthRoutes from "./routes/health.route.js";

export const buildApp = async () => {
  const env = process.env.NODE_ENV || "development";

  const fastify = Fastify({
    logger: {
      level: env === "production" ? "error" : "info",
      transport: env !== "production" ? { target: "pino-pretty" } : undefined,
    },
  });

  await fastify.register(fastifyEnv, { schema: envSchema, dotenv: true });

  await fastify.register(helmet, { global: true });

  await fastify.register(cors, {
    origin:
      fastify.config.NODE_ENV === "production" ? "https://example.com" : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  await fastify.register(sensible);

  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);
    reply.status(error.statusCode || 500).send({
      statusCode: error.statusCode || 500,
      error: error.name || "Internal Server Error",
      message: error.message,
    });
  });

  await fastify.register(healthRoutes);

  return fastify;
};
