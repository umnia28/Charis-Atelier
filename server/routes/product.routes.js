import express from "express";
import pool from "../db.js";

const router = express.Router();

/**
 * GET /api/products
 * Public shop listing
 * Supports: ?search=...
 */
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();

    const { rows } = await pool.query(
      `
      SELECT
        p.product_id,
        p.product_name,
        p.price,
        p.discount,
        p.product_description,
        p.product_count,
        p.status,
        p.visibility_status,
        p.date_added,
        c.category_name,
        st.store_id,
        st.store_name,
        (
          SELECT image_url
          FROM product_image pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.created_at ASC
          LIMIT 1
        ) AS thumbnail
      FROM product p
      LEFT JOIN category c ON c.category_id = p.category_id
      JOIN store st ON st.store_id = p.store_id
      WHERE p.visibility_status = TRUE
        AND p.status = 'active'
        AND (
          $1 = '' OR p.product_name ILIKE '%' || $1 || '%'
        )
      ORDER BY p.date_added DESC
      `,
      [search]
    );

    res.json({ products: rows });
  } catch (err) {
    console.error("GET /api/products ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
