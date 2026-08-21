import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

// Allow the Vite dev server to call this API during development.
await app.register(cors, {
  origin: "http://localhost:5173",
});

app.get("/api/health", async () => {
  return { status: "ok", service: "pokemon-go-strings-api" };
});

const PORT = 3001;

app.listen({ port: PORT }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log(`API running at http://localhost:${PORT}`);
});