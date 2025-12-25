import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/role.middleware.js';
import pool from '../db.js';

const router = express.Router();

// Get all pending vendors
router.get('/vendors', verifyToken, isAdmin, async (req,res)=>{
  const result = await pool.query('SELECT * FROM vendors WHERE approved=false');
  res.json(result.rows);
});

export default router;
