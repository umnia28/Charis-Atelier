import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/orders
 * customer: list my orders
 */
router.get("/", verifyToken, requireRole("customer"), async (req, res) => {
  try {
    const customerId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT order_id, date_added, payment_status, payment_method, total_price, discount_amount
      FROM "order"
      WHERE customer_id = $1
      ORDER BY date_added DESC
      `,
      [customerId]
    );

    res.json({ orders: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/orders/:id
 * customer: order details + items + timeline
 */
router.get("/:id", verifyToken, requireRole("customer"), async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const orderId = Number(req.params.id);

    const orderRes = await pool.query(
      `
      SELECT o.*
      FROM "order" o
      WHERE o.order_id = $1 AND o.customer_id = $2
      `,
      [orderId, customerId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemsRes = await pool.query(
      `
      SELECT
        oi.order_item_id,
        oi.product_id,
        oi.qty,
        oi.price,
        oi.discount_amount,
        p.product_name,
        s.store_name
      FROM order_item oi
      JOIN product p ON p.product_id = oi.product_id
      JOIN store s ON s.store_id = p.store_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
      `,
      [orderId]
    );

    const timelineRes = await pool.query(
      `
      SELECT status_type, status_time
      FROM order_status
      WHERE order_id = $1
      ORDER BY status_time ASC
      `,
      [orderId]
    );

    const trackerRes = await pool.query(
      `
      SELECT tracker_description, progress, estimated_delivery_date
      FROM tracker
      WHERE order_id = $1
      `,
      [orderId]
    );

    res.json({
      order: orderRes.rows[0],
      items: itemsRes.rows,
      timeline: timelineRes.rows,
      tracker: trackerRes.rows[0] || null,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
