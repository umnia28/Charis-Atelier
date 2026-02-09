import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// helper: restock base products (simple version)
async function restockOrderItems(client, orderId) {
  const { rows } = await client.query(
    `SELECT product_id, qty FROM order_item WHERE order_id=$1`,
    [orderId]
  );

  for (const r of rows) {
    await client.query(
      `UPDATE product SET product_count = product_count + $1 WHERE product_id=$2`,
      [r.qty, r.product_id]
    );
  }
}

/**
 * POST /api/admin/orders/:orderId/cancel
 * body: { reason? }
 */
router.post("/:orderId/cancel", verifyToken, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const adminId = req.user.user_id;
    const orderId = Number(req.params.orderId);
    const reason = req.body?.reason || "Cancelled by admin";

    await client.query("BEGIN");

    // lock order row
    const o = await client.query(
      `SELECT order_id, payment_status FROM "order" WHERE order_id=$1 FOR UPDATE`,
      [orderId]
    );
    if (o.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    // If already cancelled, idempotent
    const already = await client.query(
      `SELECT 1 FROM order_status WHERE order_id=$1 AND status_type='cancelled' LIMIT 1`,
      [orderId]
    );
    if (already.rowCount > 0) {
      await client.query("COMMIT");
      return res.json({ message: "Already cancelled", order_id: orderId });
    }

    await client.query(
      `UPDATE "order" SET reason_for_cancellation=$1 WHERE order_id=$2`,
      [reason, orderId]
    );

    await client.query(
      `INSERT INTO order_status(order_id, status_type, updated_by) VALUES ($1,'cancelled',$2)`,
      [orderId, adminId]
    );

    // restock (optional but recommended)
    await restockOrderItems(client, orderId);

    await client.query("COMMIT");
    res.json({ message: "Order cancelled ✅", order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ADMIN CANCEL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

/**
 * POST /api/admin/orders/:orderId/refund
 * body: { reason? }
 */
router.post("/:orderId/refund", verifyToken, requireRole("admin"), async (req, res) => {
  const client = await pool.connect();
  try {
    const adminId = req.user.user_id;
    const orderId = Number(req.params.orderId);
    const reason = req.body?.reason || "Refunded by admin";

    await client.query("BEGIN");

    const o = await client.query(
      `SELECT order_id, payment_status FROM "order" WHERE order_id=$1 FOR UPDATE`,
      [orderId]
    );
    if (o.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    // prevent double refund
    if (o.rows[0].payment_status === "refunded") {
      await client.query("COMMIT");
      return res.json({ message: "Already refunded", order_id: orderId });
    }

    if (o.rows[0].payment_status !== "paid") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Only paid orders can be refunded" });
    }

    await client.query(
      `UPDATE "order" SET payment_status='refunded', reason_for_cancellation=$1 WHERE order_id=$2`,
      [reason, orderId]
    );

    await client.query(
      `INSERT INTO order_status(order_id, status_type, updated_by) VALUES ($1,'refunded',$2)`,
      [orderId, adminId]
    );

    // restock
    await restockOrderItems(client, orderId);

    await client.query("COMMIT");
    res.json({ message: "Refund processed ✅", order_id: orderId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ADMIN REFUND ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

export default router;
