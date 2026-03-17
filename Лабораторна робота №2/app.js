const http = require("http");
const config = require("./config");

// --- ЛОГУВАННЯ (Варіант 2) ---
function logMessage(level, method, path, message, status) {
  if (config.NODE_ENV === "production" && status < 400) return;

  const time = new Date().toISOString();
  const logLine = `time="${time}" level="${level}" method="${method}" path="${path}" message="${message}" status=${status}`;

  if (level === "ERROR") {
    process.stderr.write(logLine + "\n");
  } else {
    process.stdout.write(logLine + "\n");
  }
}

// --- СТВОРЕННЯ СЕРВЕРА ---
const server = http.createServer((req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    const health = {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(health));
    return logMessage(
      "INFO",
      req.method,
      req.url,
      "Health check performed",
      200,
    );
  }

  res.writeHead(404);
  res.end("Not Found");
  logMessage("WARN", req.method, req.url, "Resource not found", 404);
});

// --- GRACEFUL SHUTDOWN ---
function gracefulShutdown(signal) {
  logMessage(
    "WARN",
    "-",
    "-",
    `Received signal: ${signal}. Shutting down server...`,
    0,
  );

  const timeout = setTimeout(() => {
    logMessage("ERROR", "-", "-", "Server close timeout. Forcing exit.", 1);
    process.exit(1);
  }, 10000);

  server.close((err) => {
    clearTimeout(timeout);
    if (err) {
      logMessage(
        "ERROR",
        "-",
        "-",
        `Error during server close: ${err.message}`,
        1,
      );
      process.exit(1);
    }
    logMessage("INFO", "-", "-", "Server gracefully stopped", 0);
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

process.on("uncaughtException", (err) => {
  logMessage("ERROR", "-", "-", `Uncaught Exception: ${err.message}`, 500);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logMessage("ERROR", "-", "-", `Unhandled Rejection: ${reason}`, 500);
  gracefulShutdown("unhandledRejection");
});

// ЗАПУСК СЕРВЕРА
server.listen(config.PORT, config.HOSTNAME, () => {
  logMessage(
    "INFO",
    "-",
    "-",
    `Server started on http://${config.HOSTNAME}:${config.PORT}`,
    200,
  );
});
