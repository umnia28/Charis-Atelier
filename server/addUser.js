import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'multivendor_db',
    password: '1234',
    port: 5432
});

const createUser = async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10); // hash password
    const text = 'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING *';
    const values = ['Admin', 'sarahhumayra28@gmail.com', hashedPassword, 'admin'];

    try {
        const res = await pool.query(text, values);
        console.log('User added:', res.rows[0]);
        pool.end();
    } catch (err) {
        console.error(err);
    }
};

createUser();
