import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * GET /api/addresses
 * returns current user's addresses
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT
        address_id,
        city,
        address,
        shipping_state,
        zip_code,
        country,
        visibility_status,
        created_at
      FROM shipping_address
      WHERE user_id = $1
        AND visibility_status = TRUE
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json({ addresses: rows });
  } catch (err) {
    console.error("GET ADDRESSES:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/addresses
 * body: { city, address, shipping_state, zip_code, country }
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { city, address, shipping_state, zip_code, country } = req.body;

    if (!address) return res.status(400).json({ message: "address required" });

    const { rows } = await pool.query(
      `
      INSERT INTO shipping_address (user_id, city, address, shipping_state, zip_code, country)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING address_id, city, address, shipping_state, zip_code, country, created_at
      `,
      [userId, city || null, address, shipping_state || null, zip_code || null, country || null]
    );

    res.status(201).json({ address: rows[0] });
  } catch (err) {
    console.error("CREATE ADDRESS:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
