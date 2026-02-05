import express from "express";
import { registerUser, loginUser, me, refreshToken } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", verifyToken, me);
router.post("/refresh-token", verifyToken, refreshToken);

export default router;
