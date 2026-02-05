import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/seller/orders
 * returns all order_items belonging to seller's stores
 */
router.get("/", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT
        o.order_id,
        o.date_added,
        o.payment_status,
        o.payment_method,
        o.total_price,
        oi.order_item_id,
        oi.product_id,
        oi.qty,
        oi.price,
        p.product_name,
        s.store_id,
        s.store_name
      FROM order_item oi
      JOIN "order" o ON o.order_id = oi.order_id
      JOIN product p ON p.product_id = oi.product_id
      JOIN store s ON s.store_id = p.store_id
      WHERE s.user_id = $1
      ORDER BY o.date_added DESC, oi.order_item_id ASC
      `,
      [sellerId]
    );

    res.json({ seller_order_items: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
