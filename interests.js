const express = require("express");
const router = express.Router();
const pool = require("../db");

// ============================
// SEND INTEREST
// ============================
router.post("/send-interest", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    // Check if interest already sent
    const conn = await pool.getConnection();
    const [check] = await conn.query(
      "SELECT * FROM interests WHERE sender_id = ? AND receiver_id = ?",
      [sender_id, receiver_id]
    );

    if (check.length > 0) {
      conn.release();
      return res.json({ success: false, message: "Interest already sent" });
    }

    // Insert interest
    await conn.query(
      "INSERT INTO interests (sender_id, receiver_id) VALUES (?, ?)",
      [sender_id, receiver_id]
    );
    conn.release();

    res.json({ success: true, message: "Interest sent successfully" });
  } catch (err) {
    console.error("Error sending interest:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================
// CHECK IF INTEREST ALREADY SENT
// ============================
router.post("/check-interest", async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.body;

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT * FROM interests WHERE sender_id=? AND receiver_id=?",
      [sender_id, receiver_id]
    );
    conn.release();

    if (rows.length > 0) {
      return res.json({ success: true, exists: true });
    }

    res.json({ success: true, exists: false });
  } catch (err) {
    console.error("Error checking interest:", err);
    res.status(500).json({ success: false });
  }
});

// ============================
// VIEW INTERESTS RECEIVED
// ============================
router.get("/received/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const conn = await pool.getConnection();
    const [rows] = await conn.query(
      `SELECT i.*, p.firstName, p.lastName, p.profileImage
       FROM interests i
       JOIN newwprofiles p ON i.sender_id = p.id
       WHERE i.receiver_id = ?`,
      [userId]
    );

    conn.release();

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error loading received interests:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
