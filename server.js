const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/db");

const server = app.listen(env.port, () => {
  console.log(`PrepWise API listening on port ${env.port} [${env.nodeEnv}]`);
});

async function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server closed. Database disconnected.");
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});
