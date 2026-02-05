import express from "express";
import pool from '../db.js';

const router = express.Router();

/**
 * GET /api/products?search=
 */
router.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;

    const { rows } = await pool.query(
      `
      SELECT
        p.product_id,
        p.product_name,
        p.price,
        p.discount,
        p.product_count,
        p.status,
        p.date_added,

        s.store_name,
        u.username AS seller_name,

        (
          SELECT image_url
          FROM product_image pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.created_at
          LIMIT 1
        ) AS image_url

      FROM product p
      JOIN store s ON s.store_id = p.store_id
      JOIN seller sel ON sel.user_id = s.user_id
      JOIN users u ON u.user_id = sel.user_id

      WHERE p.visibility_status = TRUE
        AND p.status = 'active'
        AND (
          $1 = '' OR
          p.product_name ILIKE '%' || $1 || '%'
        )

      ORDER BY p.date_added DESC
      LIMIT 50
      `,
      [search]
    );

    res.json({ products: rows });
  } catch (err) {
    console.error("GET PRODUCTS:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
