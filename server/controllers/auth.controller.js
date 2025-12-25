import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function registerUser(req, res) {
  const { name, email, password, role } = req.body;

  const normalizedEmail = email.trim().toLowerCase();
  const hashed = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (name,email,password,role) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, normalizedEmail, hashed, role || 'customer']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json(err.message);
  }
}


export async function loginUser(req, res) {
  const { email, password } = req.body;

  console.log('➡️ LOGIN EMAIL FROM CLIENT:', email);

  const normalizedEmail = email.trim().toLowerCase();
  console.log('➡️ NORMALIZED EMAIL:', normalizedEmail);

  const result = await pool.query(
    'SELECT * FROM users WHERE email=$1',
    [normalizedEmail]
  );

  console.log('➡️ DB RESULT ROWS:', result.rows);

  if (!result.rows.length) {
    console.log('❌ USER NOT FOUND');
    return res.status(400).json('User not found');
  }

  const user = result.rows[0];
  console.log('➡️ USER FROM DB:', {
    id: user.id,
    email: user.email,
    role: user.role,
    passwordHashExists: !!user.password
  });

  const valid = await bcrypt.compare(password, user.password);
  console.log('➡️ PASSWORD MATCH RESULT:', valid);

  if (!valid) {
    console.log('❌ PASSWORD INCORRECT');
    return res.status(400).json('Incorrect password');
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  console.log('✅ LOGIN SUCCESSFUL');

  res.json({ token, role: user.role, name: user.name });
}
