import express from "express";
import pool from "../db.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

// helper: ensure product belongs to seller
const assertOwnProduct = async (sellerId, productId) => {
  const { rows } = await pool.query(
    `
    SELECT p.product_id
    FROM product p
    JOIN store st ON st.store_id = p.store_id
    WHERE p.product_id = $1 AND st.user_id = $2
    `,
    [productId, sellerId]
  );
  return rows.length > 0;
};

/**
 * GET /api/seller/products
 */
router.get("/", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;

    const { rows } = await pool.query(
      `
      SELECT p.product_id, p.product_name, p.price, p.discount, p.product_count, p.status, p.visibility_status,
             p.date_added,
             st.store_id, st.store_name,
             (SELECT image_url FROM product_image pi WHERE pi.product_id=p.product_id ORDER BY pi.created_at ASC LIMIT 1) AS thumbnail
      FROM product p
      JOIN store st ON st.store_id = p.store_id
      WHERE st.user_id = $1
      ORDER BY p.date_added DESC
      `,
      [sellerId]
    );

    res.json({ products: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/seller/products
 */
router.post("/", verifyToken, requireRole("seller"), async (req, res) => {
  const client = await pool.connect();
  try {
    const sellerId = req.user.user_id;
    const {
      store_id,
      category_id = null,
      product_name,
      price,
      product_description = null,
      product_count = 0,
      discount = 0,
      images = [],
    } = req.body;

    if (!store_id || !product_name || price === undefined) {
      return res.status(400).json({ message: "store_id, product_name, price required" });
    }

    await client.query("BEGIN");

    // ✅ use client inside transaction
    const storeCheck = await client.query(
      `SELECT 1 FROM store WHERE store_id=$1 AND user_id=$2`,
      [store_id, sellerId]
    );
    if (storeCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Not your store" });
    }

    const pRes = await client.query(
      `
      INSERT INTO product (store_id, category_id, product_name, price, product_description, product_count, discount)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING product_id
      `,
      [store_id, category_id, product_name, price, product_description, product_count, discount]
    );

    const productId = pRes.rows[0].product_id;

    // images
    if (Array.isArray(images) && images.length > 0) {
      for (const url of images) {
        if (url && String(url).trim().length > 5) {
          await client.query(
            `INSERT INTO product_image(product_id, image_url) VALUES ($1,$2)`,
            [productId, url]
          );
        }
      }
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Product created ✅", product_id: productId });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    if (e.code === "23505") return res.status(409).json({ message: "Duplicate value" });
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/seller/products/:id
 */
router.put("/:id", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;
    const productId = Number(req.params.id);

    const ok = await assertOwnProduct(sellerId, productId);
    if (!ok) return res.status(403).json({ message: "Not your product" });

    const {
      category_id = null,
      product_name,
      price,
      product_description = null,
      product_count,
      discount,
      status,
      visibility_status,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE product
      SET category_id = COALESCE($1, category_id),
          product_name = COALESCE($2, product_name),
          price = COALESCE($3, price),
          product_description = COALESCE($4, product_description),
          product_count = COALESCE($5, product_count),
          discount = COALESCE($6, discount),
          status = COALESCE($7, status),
          visibility_status = COALESCE($8, visibility_status)
      WHERE product_id = $9
      `,
      [category_id, product_name, price, product_description, product_count, discount, status, visibility_status, productId]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated ✅" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/seller/products/:id
 */
router.delete("/:id", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;
    const productId = Number(req.params.id);

    const ok = await assertOwnProduct(sellerId, productId);
    if (!ok) return res.status(403).json({ message: "Not your product" });

    const result = await pool.query(`DELETE FROM product WHERE product_id=$1`, [productId]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted ✅" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/seller/products/:id/stock
 */
router.put("/:id/stock", verifyToken, requireRole("seller"), async (req, res) => {
  const client = await pool.connect();
  try {
    const sellerId = req.user.user_id;
    const productId = Number(req.params.id);

    const ok = await assertOwnProduct(sellerId, productId);
    if (!ok) return res.status(403).json({ message: "Not your product" });

    const { product_count, attribute_name, attribute_value, stock } = req.body;

    await client.query("BEGIN");

    if (product_count !== undefined) {
      const pc = Number(product_count);
      if (!Number.isInteger(pc) || pc < 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "product_count must be integer >= 0" });
      }

      await client.query(`UPDATE product SET product_count=$1 WHERE product_id=$2`, [pc, productId]);
      await client.query("COMMIT");
      return res.json({ message: "Base stock updated ✅" });
    }

    if (!attribute_name || !attribute_value || stock === undefined) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Provide product_count OR (attribute_name, attribute_value, stock)" });
    }

    const st = Number(stock);
    if (!Number.isInteger(st) || st < 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "stock must be integer >= 0" });
    }

    await client.query(
      `
      INSERT INTO product_attributes (product_id, attribute_name, attribute_value, stock)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (product_id, attribute_name, attribute_value)
      DO UPDATE SET stock = EXCLUDED.stock
      `,
      [productId, attribute_name, attribute_value, st]
    );

    await client.query("COMMIT");
    res.json({ message: "Variant stock updated ✅" });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});


// GET /api/seller/products/:id  (for edit modal)
router.get("/:id", verifyToken, requireRole("seller"), async (req, res) => {
  try {
    const sellerId = req.user.user_id;
    const productId = Number(req.params.id);

    const ok = await assertOwnProduct(sellerId, productId);
    if (!ok) return res.status(403).json({ message: "Not your product" });

    const { rows } = await pool.query(
      `
      SELECT p.*,
        COALESCE(
          (SELECT json_agg(pi.image_url ORDER BY pi.created_at ASC)
           FROM product_image pi
           WHERE pi.product_id = p.product_id),
          '[]'::json
        ) AS images
      FROM product p
      WHERE p.product_id = $1
      `,
      [productId]
    );

    res.json({ product: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
