const { createServer } = require("node:http");
const fs = require("node:fs");

// --- ПАРСИНГ ---
const env = {};
try {
  const data = fs.readFileSync(".env", "utf8");
  data.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim();
  });
} catch (err) {}

const PORT = env.PORT || 3000;
const HOSTNAME = env.HOSTNAME || "localhost";

// --- ДАНІ В ПАМ'ЯТІ (Варіант 2) ---
let TASKS = [
  { id: 1, title: "Learn Node.js", done: false, priority: "high" },
  { id: 2, title: "Practice JavaScript", done: true, priority: "medium" },
];

// --- ДОПОМІЖНА ФУНКЦІЯ ВАЛІДАЦІЇ ---
const validateTask = (data, isPartial = false) => {
  const errors = [];
  const priorities = ["low", "medium", "high"];

  if (!isPartial || data.title !== undefined) {
    if (typeof data.title !== "string" || data.title.trim().length === 0) {
      errors.push("Title must be a non-empty string");
    }
  }

  if (!isPartial || data.done !== undefined) {
    if (typeof data.done !== "boolean") {
      errors.push("Done must be a boolean (true/false)");
    }
  }

  if (!isPartial || data.priority !== undefined) {
    if (!priorities.includes(data.priority)) {
      errors.push("Priority must be one of: low, medium, high");
    }
  }

  return errors;
};

// --- СЕРВЕР ---
const server = createServer((req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  // --- GET: Список задач з фільтрацією по пріоритету ---
  if (method === "GET" && pathname === "/tasks") {
    const priority = parsedUrl.searchParams.get("priority");

    let results = [...TASKS];
    if (priority) {
      results = results.filter((t) => t.priority === priority.toLowerCase());
    }

    res.statusCode = 200;
    return res.end(JSON.stringify({ count: results.length, items: results }));
  }

  // --- POST: Створення нової задачі ---
  if (method === "POST" && pathname === "/tasks") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const errors = validateTask(data);

        if (errors.length > 0) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ errors }));
        }

        const nextId =
          TASKS.length > 0 ? Math.max(...TASKS.map((t) => t.id)) + 1 : 1;
        const newTask = {
          id: nextId,
          title: data.title,
          done: data.done !== undefined ? data.done : false,
          priority: data.priority,
        };

        TASKS.push(newTask);
        res.statusCode = 201;
        res.end(JSON.stringify({ message: "Created", task: newTask }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // --- PATCH: Оновлення задачі за ID ---
  if (method === "PATCH" && pathname.startsWith("/tasks/")) {
    const id = parseInt(pathname.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      const index = TASKS.findIndex((t) => t.id === id);
      if (index === -1) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: "Task not found" }));
      }

      try {
        const updates = JSON.parse(body);
        const errors = validateTask(updates, true);

        if (errors.length > 0) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ errors }));
        }

        delete updates.id;

        TASKS[index] = { ...TASKS[index], ...updates };
        res.statusCode = 200;
        res.end(JSON.stringify({ message: "Updated", task: TASKS[index] }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // --- DELETE: Видалення задачі ---
  if (method === "DELETE" && pathname.startsWith("/tasks/")) {
    const id = parseInt(pathname.split("/")[2]);
    const originalLength = TASKS.length;
    TASKS = TASKS.filter((t) => t.id !== id);

    if (TASKS.length < originalLength) {
      res.statusCode = 200;
      res.end(JSON.stringify({ message: "Deleted" }));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Task not found" }));
    }
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Route not found" }));
});

// Запуск сервера
server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
  console.log(
    `Available endpoints: GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id`,
  );
});
