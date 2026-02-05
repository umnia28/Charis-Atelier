import pool from '../db.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getUserRole = async (userId) => {
  const { rows } = await pool.query(
    `
    SELECT
      CASE
        WHEN a.user_id IS NOT NULL THEN 'admin'
        WHEN s.user_id IS NOT NULL THEN 'seller'
        WHEN c.user_id IS NOT NULL THEN 'customer'
        ELSE 'user'
      END AS role
    FROM users u
    LEFT JOIN admin a    ON a.user_id = u.user_id
    LEFT JOIN seller s   ON s.user_id = u.user_id
    LEFT JOIN customer c ON c.user_id = u.user_id
    WHERE u.user_id = $1
    `,
    [userId]
  );
  return rows[0]?.role || "user";
};

const signToken = (user) =>
  jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      role: user.role, // ✅ include role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, contact_no, full_name, gender } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, password required" });
    }

    const dup = await pool.query(
      `SELECT 1 FROM users WHERE username=$1 OR email=$2`,
      [username, email]
    );
    if (dup.rowCount > 0) {
      return res.status(409).json({ message: "username or email already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, contact_no, full_name, gender)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING user_id, username, email, status, created_at`,
      [username, email, password_hash, contact_no || null, full_name || null, gender || null]
    );

    const user = rows[0];

    // ✅ recommended: new users are customers by default
    await pool.query(
      `INSERT INTO customer(user_id) VALUES ($1) ON CONFLICT DO NOTHING`,
      [user.user_id]
    );

    user.role = await getUserRole(user.user_id);

    const token = signToken(user);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "email/username and password required" });
    }

    const { rows } = await pool.query(
      `SELECT user_id, username, email, password_hash, status
       FROM users
       WHERE email=$1 OR username=$1
       LIMIT 1`,
      [emailOrUsername]
    );

    if (rows.length === 0) return res.status(401).json({ message: "invalid credentials" });

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({ message: "account is not active" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "invalid credentials" });

    user.role = await getUserRole(user.user_id);

    const token = signToken(user);
    delete user.password_hash;

    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.status,
        u.created_at,

        CASE
          WHEN a.user_id IS NOT NULL THEN 'admin'
          WHEN s.user_id IS NOT NULL THEN 'seller'
          WHEN c.user_id IS NOT NULL THEN 'customer'
          ELSE 'user'
        END AS role

      FROM users u
      LEFT JOIN admin a    ON a.user_id = u.user_id
      LEFT JOIN seller s   ON s.user_id = u.user_id
      LEFT JOIN customer c ON c.user_id = u.user_id
      WHERE u.user_id = $1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const refreshToken = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // get base user fields
    const { rows } = await pool.query(
      `
      SELECT user_id, username, email, status
      FROM users
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({ message: "account is not active" });
    }

    // recompute role from subtype tables
    const roleRes = await pool.query(
      `
      SELECT
        CASE
          WHEN a.user_id IS NOT NULL THEN 'admin'
          WHEN s.user_id IS NOT NULL THEN 'seller'
          WHEN c.user_id IS NOT NULL THEN 'customer'
          ELSE 'user'
        END AS role
      FROM users u
      LEFT JOIN admin a    ON a.user_id = u.user_id
      LEFT JOIN seller s   ON s.user_id = u.user_id
      LEFT JOIN customer c ON c.user_id = u.user_id
      WHERE u.user_id = $1
      `,
      [userId]
    );

    user.role = roleRes.rows[0]?.role || "user";

    // sign fresh token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({ token, user });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    return res.status(500).json({ message: "server error" });
  }
};





