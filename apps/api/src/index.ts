import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { pokemonRoutes } from "./routes/pokemon.js";
import { searchRoutes } from "./routes/search.js";
import { familyRoutes } from "./routes/families.js";


const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "http://localhost:5173",
});

await app.register(pokemonRoutes);
await app.register(searchRoutes);
await app.register(familyRoutes);

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