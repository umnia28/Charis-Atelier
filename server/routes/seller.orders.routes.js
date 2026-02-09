import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/seller/orders
 * Returns order items for products owned by this seller.
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
        o.transaction_id,

        oi.order_item_id,
        oi.product_id,
        p.product_name,
        oi.qty,
        oi.price,
        oi.discount_amount,

        u.user_id AS customer_id,
        u.username AS customer_username,
        u.email AS customer_email,

        (
          SELECT os.status_type
          FROM order_status os
          WHERE os.order_id = o.order_id
          ORDER BY os.status_time DESC
          LIMIT 1
        ) AS latest_status

      FROM order_item oi
      JOIN product p ON p.product_id = oi.product_id
      JOIN store st ON st.store_id = p.store_id
      JOIN "order" o ON o.order_id = oi.order_id
      JOIN users u ON u.user_id = o.customer_id

      WHERE st.user_id = $1
      ORDER BY o.date_added DESC, oi.order_item_id DESC
      `,
      [sellerId]
    );

    res.json({ items: rows });
  } catch (err) {
    console.error("SELLER ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
