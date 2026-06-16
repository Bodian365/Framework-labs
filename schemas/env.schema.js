export const envSchema = {
  type: "object",
  required: ["PORT", "HOST", "NODE_ENV", "ADMIN_API_KEY"],
  properties: {
    PORT: { type: "number", default: 3000 },
    HOST: { type: "string", default: "127.0.0.1" },
    NODE_ENV: { type: "string", enum: ["development", "production"] },
    ADMIN_API_KEY: { type: "string" },
  },
};
