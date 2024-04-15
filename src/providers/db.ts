import { Pool } from "pg";

export function getConfig() {
  console.log(process.env);
  return {
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432
  }
}

export function getPool() {
  return new Pool(getConfig());
}