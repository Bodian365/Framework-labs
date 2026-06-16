const requiredEnv = ["PORT", "HOSTNAME", "NODE_ENV"];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Помилка: Змінна середовища ${key} не визначена.`);
    process.exit(1);
  }
});

if (!["development", "production"].includes(process.env.NODE_ENV)) {
  console.error('Помилка: NODE_ENV має бути "development" або "production".');
  process.exit(1);
}

module.exports = {
  PORT: parseInt(process.env.PORT, 10),
  HOSTNAME: process.env.HOSTNAME,
  NODE_ENV: process.env.NODE_ENV,
};
