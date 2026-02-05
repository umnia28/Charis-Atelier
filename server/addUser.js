import pg from 'pg';
import bcrypt from 'bcrypt';

const pool = new pg.Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CharisAtelier_db',
  password: '1234',
  port: 5432
});

const createUser = async () => {
  try {
    const password = 'admin123';  //Password
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (username, email, password_hash, full_name, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, username, email
      `,
      [
        'admin',
        'sarahhumayra28@gmail.com',
        passwordHash,
        'Admin User',
        'active'
      ]
    );

    const userId = result.rows[0].user_id;

    // 👇 assign role properly (admin)
    await pool.query(
      `INSERT INTO admin (user_id) VALUES ($1)`,
      [userId]
    );

    console.log('✅ User created:', result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating user:', err);
  } finally {
    pool.end();
  }
};

createUser();
