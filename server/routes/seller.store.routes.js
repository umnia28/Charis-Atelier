import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/seller/store
 * returns seller's store (if exists)
 */
router.get("/", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT store_id, user_id, store_name, store_status, ref_no, created_at
      FROM store
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [sellerId]
    );

    res.json({ store: rows[0] || null });
  } catch (err) {
    console.error("GET STORE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/seller/store
 * create seller store
 * body: { store_name, ref_no? }
 */
router.post("/", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;
    const { store_name, ref_no = null } = req.body;

    if (!store_name || store_name.trim().length < 2) {
      return res.status(400).json({ message: "store_name required" });
    }

    // Optional: ensure seller is approved (kyc_status)
    const sRes = await pool.query(
      `SELECT kyc_status FROM seller WHERE user_id=$1`,
      [sellerId]
    );
    if (sRes.rows.length === 0) {
      return res.status(403).json({ message: "Seller profile not found" });
    }
    if (sRes.rows[0].kyc_status !== "approved") {
      return res.status(403).json({ message: "Seller not approved yet" });
    }

    // Restrict to ONE store per seller (recommended)
    const exists = await pool.query(`SELECT 1 FROM store WHERE user_id=$1`, [sellerId]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ message: "Store already exists for this seller" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO store (user_id, store_name, ref_no)
      VALUES ($1, $2, $3)
      RETURNING store_id, user_id, store_name, store_status, ref_no, created_at
      `,
      [sellerId, store_name.trim(), ref_no]
    );

    res.status(201).json({ message: "Store created ✅", store: rows[0] });
  } catch (err) {
    console.error("CREATE STORE ERROR:", err);
    // ref_no unique conflict
    if (err.code === "23505") {
      return res.status(409).json({ message: "ref_no already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
