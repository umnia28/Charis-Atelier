import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'multivendor_db',
  password: process.env.DB_PASSWORD,
  port: 5432
});

export default pool;
