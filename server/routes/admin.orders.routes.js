import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post("/:id/cancel", verifyToken, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const adminId = req.user.user_id;
    const orderId = Number(req.params.id);
    const { reason = "Cancelled by admin" } = req.body;

    await client.query("BEGIN");

    const oRes = await client.query(
      `SELECT order_id, payment_status, reason_for_cancellation
       FROM "order"
       WHERE order_id = $1
       FOR UPDATE`,
      [orderId]
    );

    if (oRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const order = oRes.rows[0];
    if (order.reason_for_cancellation) {
      await client.query("COMMIT");
      return res.json({ message: "Already cancelled", order_id: orderId });
    }

    await client.query(
      `UPDATE "order"
       SET reason_for_cancellation = $1
       WHERE order_id = $2`,
      [reason, orderId]
    );

    await client.query(
      `INSERT INTO order_status(order_id, status_type, updated_by)
       VALUES ($1,'cancelled',$2)`,
      [orderId, adminId]
    );

    await client.query("COMMIT");
    res.json({ message: "Order cancelled ✅", order_id: orderId });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(400).json({ message: e.message || "Cancel failed" });
  } finally {
    client.release();
  }
});

router.post("/:id/refund", verifyToken, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const adminId = req.user.user_id;
    const orderId = Number(req.params.id);

    await client.query("BEGIN");

    const oRes = await client.query(
      `SELECT order_id, payment_status, transaction_id
       FROM "order"
       WHERE order_id = $1
       FOR UPDATE`,
      [orderId]
    );

    if (oRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const order = oRes.rows[0];

    if (order.payment_status === "refunded") {
      await client.query("COMMIT");
      return res.json({ message: "Already refunded", order_id: orderId });
    }

    if (order.payment_status !== "paid") {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Cannot refund: order not paid" });
    }

    await client.query(
      `UPDATE "order"
       SET payment_status = 'refunded'
       WHERE order_id = $1`,
      [orderId]
    );

    await client.query(
      `INSERT INTO order_status(order_id, status_type, updated_by)
       VALUES ($1,'refunded',$2)`,
      [orderId, adminId]
    );

    await client.query("COMMIT");
    res.json({ message: "Refunded ✅", order_id: orderId });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(400).json({ message: e.message || "Refund failed" });
  } finally {
    client.release();
  }
});


router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT order_id, customer_id, date_added, payment_status, payment_method, total_price, transaction_id, reason_for_cancellation
      FROM "order"
      ORDER BY date_added DESC
      LIMIT 50
      `
    );
    res.json({ orders: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
