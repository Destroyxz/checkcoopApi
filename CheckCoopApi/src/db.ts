import mysql, { Pool } from 'mysql2/promise';

declare const process: {
  env: {
    DB_HOST: string;
    DB_USER: string;
    DB_PASS: string;
    DB_NAME: string;
    [key: string]: string | undefined;
  };
};

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;