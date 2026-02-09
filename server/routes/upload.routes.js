import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/upload  (field name MUST be "files")
router.post("/", upload.array("files", 10), (req, res) => {
  const urls = (req.files || []).map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
