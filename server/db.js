import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CharisAtelier_db',
  password: process.env.DB_PASSWORD,
  port: 5432
});

pool.on("connect",()=>{
  console.log("PostgreSQL connected");
});

export default pool;
