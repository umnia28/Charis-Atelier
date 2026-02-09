import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

/**
 * GET /api/orders/:orderId/timeline
 * Anyone logged in can view for now (later you can restrict to owner/seller/admin).
 */
router.get("/:orderId/timeline", verifyToken, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    const { rows } = await pool.query(
      `
      SELECT
        os.order_status_id,
        os.status_type,
        os.status_time,
        os.updated_by,
        u.username AS updated_by_username
      FROM order_status os
      LEFT JOIN users u ON u.user_id = os.updated_by
      WHERE os.order_id = $1
      ORDER BY os.status_time ASC
      `,
      [orderId]
    );

    res.json({ timeline: rows });
  } catch (err) {
    console.error("TIMELINE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
