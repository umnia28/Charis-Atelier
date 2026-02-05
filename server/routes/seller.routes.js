import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { applySeller } from "../controllers/seller.controller.js";

const router = express.Router();

/**
 * POST /api/seller/become-seller
 * Customer applies to become a seller
 */
router.post(
  "/become-seller",
  verifyToken,
  applySeller
);

/**
 * GET /api/seller/dashboard
 * Seller-only dashboard access
 */
router.get(
  "/dashboard",
  verifyToken,
  requireRole("seller"),
  (req, res) => {
    res.json({ message: "Seller dashboard access granted" });
  }
);

export default router;
