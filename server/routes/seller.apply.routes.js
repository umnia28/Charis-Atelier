import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * POST /api/seller/apply
 * customer applies to become seller
 * body: { business_name }
 */
router.post("/apply", verifyToken, requireRole("customer"), async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { business_name } = req.body;

    if (!business_name || business_name.trim().length < 2) {
      return res.status(400).json({ message: "business_name required" });
    }

    // prevent duplicate seller row
    const exists = await pool.query(`SELECT 1 FROM seller WHERE user_id = $1`, [userId]);
    if (exists.rowCount > 0) {
      // If already exists, show status
      const { rows } = await pool.query(
        `SELECT kyc_status, approved_at FROM seller WHERE user_id=$1`,
        [userId]
      );
      return res.status(409).json({
        message: "Seller application already exists",
        seller: rows[0],
      });
    }

    // Insert seller request as pending
    // approved_by required in schema -> we must allow NULL initially OR use a "system admin"
    // YOUR schema has approved_by BIGINT NOT NULL, so we must handle this:
    // ✅ Solution: create a "system admin" user_id (first admin) and store in env: DEFAULT_ADMIN_ID
    const defaultAdminId = Number(process.env.DEFAULT_ADMIN_ID);
    if (!defaultAdminId) {
      return res.status(500).json({
        message: "Server not configured: DEFAULT_ADMIN_ID missing",
      });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO seller (user_id, approved_by, business_name, kyc_status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING user_id, business_name, kyc_status, approved_at
      `,
      [userId, defaultAdminId, business_name.trim()]
    );

    res.status(201).json({
      message: "Seller application submitted ✅",
      seller: rows[0],
      note: "Wait for admin approval",
    });
  } catch (err) {
    console.error("SELLER APPLY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/seller/application
 * customer can check their application status
 */
router.get("/application", verifyToken, requireRole("customer", "seller"), async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT user_id, business_name, kyc_status, approved_by, approved_at
      FROM seller
      WHERE user_id = $1
      `,
      [userId]
    );

    res.json({ seller: rows[0] || null });
  } catch (err) {
    console.error("SELLER APPLICATION STATUS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
