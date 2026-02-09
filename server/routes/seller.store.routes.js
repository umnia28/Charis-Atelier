import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/seller/store
 * Get seller's store (if exists)
 */
router.get(
  "/store",
  verifyToken,
  requireRole("seller"),
  async (req, res) => {
    try {
      const sellerId = req.user.user_id;

      const { rows } = await pool.query(
        `
        SELECT *
        FROM store
        WHERE user_id = $1
        LIMIT 1
        `,
        [sellerId]
      );

      res.json({ store: rows[0] || null });
    } catch (err) {
      console.error("GET STORE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * POST /api/seller/store
 * Create store (only once, only if approved)
 */
router.post(
  "/store",
  verifyToken,
  requireRole("seller"),
  async (req, res) => {
    const client = await pool.connect();
    try {
      const sellerId = req.user.user_id;
      const { store_name, ref_no } = req.body;

      if (!store_name) {
        return res.status(400).json({ message: "store_name is required" });
      }

      await client.query("BEGIN");

      // 1️⃣ check seller approval
      const sellerCheck = await client.query(
        `SELECT kyc_status FROM seller WHERE user_id=$1`,
        [sellerId]
      );

      if (
        sellerCheck.rows.length === 0 ||
        sellerCheck.rows[0].kyc_status !== "approved"
      ) {
        await client.query("ROLLBACK");
        return res
          .status(403)
          .json({ message: "Seller not approved yet" });
      }

      // 2️⃣ ensure no existing store
      const existing = await client.query(
        `SELECT 1 FROM store WHERE user_id=$1`,
        [sellerId]
      );

      if (existing.rows.length > 0) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({ message: "Store already exists" });
      }

      // 3️⃣ create store
      const { rows } = await client.query(
        `
        INSERT INTO store (user_id, store_name, ref_no)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [sellerId, store_name, ref_no || null]
      );

      await client.query("COMMIT");
      res.status(201).json({ store: rows[0] });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("CREATE STORE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    } finally {
      client.release();
    }
  }
);

/**
 * GET /api/seller/stores
 * Public list of stores (for viewing existing stores)
 */
router.get("/stores", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT store_id, store_name, ref_no, store_status, created_at
      FROM store
      WHERE store_status = 'active'
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({ stores: rows });
  } catch (err) {
    console.error("LIST STORES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
