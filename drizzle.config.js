import { defineConfig } from "drizzle-kit";
import env from "./src/config/env.js";

if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in the environment variables.");
}

export default defineConfig({
    schema: "./src/db/schema.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: env.DATABASE_URL
    }
})