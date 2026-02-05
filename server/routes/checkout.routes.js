import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * POST /api/checkout
 * body: {
 *   address_id: number,
 *   payment_method: "cod" | "bkash_mock" | "card_mock",
 *   promo_id?: number | null,
 *   items: [{ product_id: number, qty: number }]
 * }
 */
router.post("/", verifyToken, requireRole("customer"), async (req, res) => {
  const customerId = req.user.user_id;
  const { address_id, payment_method = "cod", promo_id = null, items } = req.body;

  if (!address_id) return res.status(400).json({ message: "address_id required" });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items required" });
  }

  // normalize
  const normalized = items
    .map((i) => ({ product_id: Number(i.product_id), qty: Number(i.qty) }))
    .filter((i) => i.product_id > 0 && i.qty > 0);

  if (normalized.length === 0) {
    return res.status(400).json({ message: "Invalid items" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // create order first
    const orderRes = await client.query(
      `
      INSERT INTO "order"(customer_id, address_id, promo_id, payment_method, payment_status)
      VALUES ($1,$2,$3,$4,'pending')
      RETURNING order_id
      `,
      [customerId, address_id, promo_id, payment_method]
    );

    const orderId = orderRes.rows[0].order_id;

    let totalPrice = 0;
    let totalDiscount = 0;

    for (const it of normalized) {
      // lock the product row to prevent overselling
      const pr = await client.query(
        `
        SELECT product_id, price, discount, product_count, status, visibility_status
        FROM product
        WHERE product_id = $1
        FOR UPDATE
        `,
        [it.product_id]
      );

      if (pr.rows.length === 0) throw new Error(`Product not found: ${it.product_id}`);

      const p = pr.rows[0];

      if (p.status !== "active" || p.visibility_status !== true) {
        throw new Error(`Product not available: ${it.product_id}`);
      }

      if (p.product_count < it.qty) {
        throw new Error(`Insufficient stock for product ${it.product_id}`);
      }

      // update stock
      await client.query(
        `
        UPDATE product
        SET product_count = product_count - $1
        WHERE product_id = $2
        `,
        [it.qty, it.product_id]
      );

      const unitPrice = Number(p.price);
      const unitDiscount = Number(p.discount);

      const linePrice = unitPrice * it.qty;
      const lineDiscount = unitDiscount * it.qty;

      totalPrice += linePrice;
      totalDiscount += lineDiscount;

      // order_item insert
      await client.query(
        `
        INSERT INTO order_item (order_id, product_id, qty, price, discount_amount, seller_earnings)
        VALUES ($1,$2,$3,$4,$5,0)
        `,
        [orderId, it.product_id, it.qty, unitPrice, lineDiscount]
      );
    }

    // promo handling (simple fixed discount) - optional
    let promoDiscount = 0;
    if (promo_id) {
      const promoRes = await client.query(
        `
        SELECT promo_discount, promo_status, promo_start_date, promo_end_date
        FROM promo
        WHERE promo_id = $1
        `,
        [promo_id]
      );
      if (promoRes.rows.length > 0) {
        const promo = promoRes.rows[0];
        const today = new Date();
        const startOk = !promo.promo_start_date || new Date(promo.promo_start_date) <= today;
        const endOk = !promo.promo_end_date || new Date(promo.promo_end_date) >= today;

        if (promo.promo_status === "active" && startOk && endOk) {
          promoDiscount = Number(promo.promo_discount);
        }
      }
    }

    const finalTotal = Math.max(0, totalPrice - totalDiscount - promoDiscount);

    await client.query(
      `
      UPDATE "order"
      SET discount_amount = $1,
          total_price = $2
      WHERE order_id = $3
      `,
      [totalDiscount + promoDiscount, finalTotal, orderId]
    );

    // status timeline: placed
    await client.query(
      `
      INSERT INTO order_status(order_id, status_type, updated_by)
      VALUES ($1,'placed',$2)
      `,
      [orderId, customerId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Order placed ✅",
      order_id: orderId,
      total_price: finalTotal,
      payment_status: "pending",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CHECKOUT ERROR:", err.message || err);
    res.status(400).json({ message: err.message || "Checkout failed" });
  } finally {
    client.release();
  }
});

export default router;
