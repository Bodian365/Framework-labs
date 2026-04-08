import { MESSAGES } from "../constants/messages.js";

export default async function (fastify, opts) {
  fastify.get("/health", async (request, reply) => {
    return { status: "ok" };
  });

  fastify.get(
    "/health/details",
    {
      onRequest: async (request, reply) => {
        if (request.headers["x-api-key"] !== fastify.config.ADMIN_API_KEY) {
          throw reply.unauthorized(MESSAGES.UNAUTHORIZED);
        }
      },
    },
    async (request, reply) => {
      return {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      };
    },
  );
}
