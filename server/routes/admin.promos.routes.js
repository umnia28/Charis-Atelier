import express from "express";
import pool from '../db.js';
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

/**
 * GET /api/admin/promos
 */
router.get("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM promo ORDER BY promo_id DESC`
    );
    res.json({ promos: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/admin/promos
 * body: { promo_name, promo_discount, promo_start_date?, promo_end_date?, promo_status? }
 */
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const {
      promo_name,
      promo_discount,
      promo_start_date = null,
      promo_end_date = null,
      promo_status = "inactive",
    } = req.body;

    if (!promo_name || promo_discount === undefined) {
      return res.status(400).json({ message: "promo_name and promo_discount required" });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO promo (admin_user_id, promo_name, promo_discount, promo_start_date, promo_end_date, promo_status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [adminId, promo_name, promo_discount, promo_start_date, promo_end_date, promo_status]
    );

    res.status(201).json({ message: "Promo created ✅", promo: rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PATCH /api/admin/promos/:id/status
 * body: { promo_status: 'active'|'inactive' }
 */
router.patch("/:id/status", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const promoId = Number(req.params.id);
    const { promo_status } = req.body;

    if (!["active", "inactive"].includes(promo_status)) {
      return res.status(400).json({ message: "promo_status must be active or inactive" });
    }

    await pool.query(
      `UPDATE promo SET promo_status=$1 WHERE promo_id=$2`,
      [promo_status, promoId]
    );

    res.json({ message: "Promo status updated ✅" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
