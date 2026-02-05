import express from "express";
import crypto from "crypto";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// In-memory payment sessions (mock)
const sessions = new Map();

/**
 * POST /api/payments/session
 * body: { order_id, provider: "stripe_mock" | "bkash_mock" }
 * Creates a mock payment session if order is payable.
 */
router.post("/session", verifyToken, requireRole("customer"), async (req, res) => {
  try {
    const customerId = req.user.user_id;
    const { order_id, provider = "stripe_mock" } = req.body;

    if (!order_id) return res.status(400).json({ message: "order_id required" });

    // Ensure order belongs to this customer
    const { rows } = await pool.query(
      `
      SELECT order_id, customer_id, total_price, payment_status, transaction_id
      FROM "order"
      WHERE order_id = $1 AND customer_id = $2
      `,
      [order_id, customerId]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Order not found" });

    const order = rows[0];

    if (order.payment_status === "paid") {
      return res.status(409).json({
        message: "Order already paid",
        order_id: order.order_id,
        payment_status: order.payment_status,
        transaction_id: order.transaction_id,
      });
    }

    // Create session
    const session_id = crypto.randomUUID();
    const created_at = Date.now();

    sessions.set(session_id, {
      session_id,
      order_id: Number(order.order_id),
      customer_id: Number(order.customer_id),
      provider,
      amount: Number(order.total_price),
      status: "created",
      created_at,
      // simple TTL (10 min)
      expires_at: created_at + 10 * 60 * 1000,
    });

    res.json({
      message: "Payment session created",
      session_id,
      provider,
      order_id: order.order_id,
      amount: Number(order.total_price),
      expires_in_seconds: 600,
    });
  } catch (err) {
    console.error("PAYMENT SESSION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/payments/confirm
 * body: { session_id }
 * Confirms mock payment:
 * - prevents double pay
 * - sets order.payment_status='paid'
 * - sets order.transaction_id (unique per order)
 */
router.post("/confirm", verifyToken, requireRole("customer"), async (req, res) => {
  const client = await pool.connect();

  try {
    const customerId = req.user.user_id;
    const { session_id } = req.body;

    if (!session_id) return res.status(400).json({ message: "session_id required" });

    const session = sessions.get(session_id);
    if (!session) return res.status(404).json({ message: "Invalid/expired session" });

    if (Date.now() > session.expires_at) {
      sessions.delete(session_id);
      return res.status(410).json({ message: "Session expired" });
    }

    if (session.customer_id !== Number(customerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await client.query("BEGIN");

    // Lock order row to prevent concurrent double pay
    const { rows } = await client.query(
      `
      SELECT order_id, payment_status, transaction_id, total_price
      FROM "order"
      WHERE order_id = $1 AND customer_id = $2
      FOR UPDATE
      `,
      [session.order_id, customerId]
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Order not found" });
    }

    const order = rows[0];

    // ✅ prevent double pay (idempotent)
    if (order.payment_status === "paid") {
      await client.query("COMMIT");
      sessions.delete(session_id);
      return res.status(200).json({
        message: "Already paid (no action taken)",
        order_id: order.order_id,
        payment_status: order.payment_status,
        transaction_id: order.transaction_id,
      });
    }

    // extra safety: amount check
    const amount = Number(order.total_price);
    if (amount !== Number(session.amount)) {
      throw new Error("Payment amount mismatch");
    }

    // Create a transaction id
    const transaction_id = `${session.provider.toUpperCase()}_${crypto.randomUUID()}`;

    // Mark paid
    await client.query(
      `
      UPDATE "order"
      SET payment_status = 'paid',
          transaction_id = $1
      WHERE order_id = $2
      `,
      [transaction_id, session.order_id]
    );

    // Add order status timeline update
    await client.query(
      `
      INSERT INTO order_status(order_id, status_type, updated_by)
      VALUES ($1, 'paid', $2)
      `,
      [session.order_id, customerId]
    );

    await client.query("COMMIT");

    // cleanup session
    sessions.delete(session_id);

    res.json({
      message: "Payment successful ✅",
      order_id: session.order_id,
      payment_status: "paid",
      transaction_id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PAYMENT CONFIRM ERROR:", err);
    res.status(400).json({ message: err.message || "Payment failed" });
  } finally {
    client.release();
  }
});

export default router;
