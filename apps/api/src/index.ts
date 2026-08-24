import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import secureSession from "@fastify/secure-session";
import { readFileSync } from "fs";
import { pokemonRoutes } from "./routes/pokemon.js";
import { searchRoutes } from "./routes/search.js";
import { familyRoutes } from "./routes/families.js";
import { authRoutes } from "./routes/auth.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "http://localhost:5173",
  credentials: true, // allow cookies to be sent cross-origin (frontend :5173 <-> backend :3001)
});

await app.register(cookie);

await app.register(secureSession, {
  key: readFileSync("session-key"),
  cookie: {
    path: "/",
    httpOnly: true,
    secure: false, // set true in production (requires HTTPS)
    sameSite: "lax",
  },
});

await app.register(pokemonRoutes);
await app.register(searchRoutes);
await app.register(familyRoutes);
await app.register(authRoutes);

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