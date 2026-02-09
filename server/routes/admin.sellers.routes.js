import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/admin/sellers/pending
 * list pending sellers
 */
router.get("/pending", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        s.user_id,
        s.business_name,
        s.kyc_status,
        u.username,
        u.email,
        u.created_at
      FROM seller s
      JOIN users u ON u.user_id = s.user_id
      WHERE s.kyc_status = 'pending'
      ORDER BY u.created_at DESC
      `
    );

    return res.json({ sellers: rows }); // 
  } catch (err) {
    console.error("ADMIN LIST PENDING SELLERS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


/**
 * POST /api/admin/sellers/:userId/approve
 */
router.post("/:userId/approve", verifyToken, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const adminId = req.user.user_id;
    const sellerUserId = Number(req.params.userId);

    await client.query("BEGIN");

    const check = await client.query(
      `SELECT user_id, kyc_status FROM seller WHERE user_id=$1 FOR UPDATE`,
      [sellerUserId]
    );
    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Seller application not found" });
    }

    if (check.rows[0].kyc_status === "approved") {
      await client.query("COMMIT");
      return res.json({ message: "Already approved", user_id: sellerUserId });
    }

    await client.query(
      `
      UPDATE seller
      SET kyc_status='approved',
          approved_by=$1,
          approved_at=now()
      WHERE user_id=$2
      `,
      [adminId, sellerUserId]
    );

    await client.query("COMMIT");
    res.json({ message: "Seller approved ✅", user_id: sellerUserId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ADMIN APPROVE SELLER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

/**
 * POST /api/admin/sellers/:userId/reject
 * body: { reason? }
 */
router.post("/:userId/reject", verifyToken, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const adminId = req.user.user_id;
    const sellerUserId = Number(req.params.userId);

    await client.query("BEGIN");

    const check = await client.query(
      `SELECT user_id, kyc_status FROM seller WHERE user_id=$1 FOR UPDATE`,
      [sellerUserId]
    );
    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Seller application not found" });
    }

    if (check.rows[0].kyc_status === "rejected") {
      await client.query("COMMIT");
      return res.json({ message: "Already rejected", user_id: sellerUserId });
    }

    await client.query(
      `
      UPDATE seller
      SET kyc_status='rejected',
          approved_by=$1,
          approved_at=now()
      WHERE user_id=$2
      `,
      [adminId, sellerUserId]
    );

    await client.query("COMMIT");
    res.json({ message: "Seller rejected ✅", user_id: sellerUserId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ADMIN REJECT SELLER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

export default router;
