import pool from "../db.js";

export const applySeller = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { business_name } = req.body;

    if (!business_name) {
      return res.status(400).json({ message: "Business name required" });
    }

    // prevent duplicate request
    const exists = await pool.query(
      "SELECT 1 FROM seller WHERE user_id = $1",
      [userId]
    );

    if (exists.rowCount > 0) {
      return res.status(409).json({ message: "Seller request already exists" });
    }

    await pool.query(
      `
      INSERT INTO seller (user_id, business_name, approved_by)
      VALUES ($1, $2, $3)
      `,
      [userId, business_name, process.env.DEFAULT_ADMIN_ID]
    );

    res.status(201).json({
      message: "Seller request submitted. Await admin approval.",
    });
  } catch (err) {
    console.error("BECOME SELLER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
