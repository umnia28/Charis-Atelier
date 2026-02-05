import express from 'express';
import pool from '../db.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';


const router = express.Router();

// Get all pending vendors
router.get('/vendors', verifyToken, isAdmin, async (req,res)=>{
  const result = await pool.query('SELECT * FROM vendors WHERE approved=false');
  res.json(result.rows);
});

export default router;

/*import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  requireRole("admin"),
  async (req, res) => {
    res.json({ message: "Admin dashboard access granted" });
  }
);

export default router;
*/
