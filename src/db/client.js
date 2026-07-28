import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import env from "../config/env.js";

if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

const db = drizzle(pool);

export default db;