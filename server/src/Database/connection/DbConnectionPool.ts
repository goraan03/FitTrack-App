import mysql, { Pool, PoolOptions } from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const config: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
};

if (process.env.DB_SSL_MODE === "REQUIRED") {
  config.ssl = { rejectUnauthorized: false };
}

const db: Pool = mysql.createPool(config);
export default db;