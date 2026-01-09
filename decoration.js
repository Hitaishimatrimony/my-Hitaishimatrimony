const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// ✅ Create the table if it doesn't exist
(async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS decoration_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        weddingDate DATE,
        venue TEXT,
        additional TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
    await db.query(createTableQuery);
    console.log("✅ 'decoration_bookings' table ensured.");
  } catch (err) {
    console.error("❌ Table creation failed:", err);
  }
})();

// ✅ Setup NodeMailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hitaishimatrimony@gmail.com',         // ✅ Your Gmail address
    pass: 'hgkh ylho pibp bopl'       // ✅ App password from Google
  }
});

// ✅ POST request for decoration booking with email sending
router.post('/decoration', async (req, res) => {
  const { fullName, email, phone, weddingDate, venue, additional } = req.body;

  try {
    const insertQuery = `
      INSERT INTO decoration_bookings (fullName, email, phone, weddingDate, venue, additional)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(insertQuery, [
      fullName, email, phone, weddingDate, venue, additional
    ]);

    // ✅ Send confirmation email to the user
    const mailOptions = {
      from: 'hitaishimatrimony@gmail.com',
      to: email,
      subject: 'Wedding Decoration Booking Confirmed 🎉',
      html: `
        <div style="font-family:sans-serif;background:#f9f9f9;padding:20px;border-radius:8px;">
          <h2 style="color:#d63384;">Hi ${fullName},</h2>
          <p>Thank you for booking our wedding decoration services! 💐</p>
          <h3 style="margin-top:20px;">Booking Details:</h3>
          <ul style="line-height:1.6;">
            <li><strong>Phone:</strong> ${phone}</li>
            <li><strong>Wedding Date:</strong> ${weddingDate}</li>
            <li><strong>Venue:</strong> ${venue}</li>
            <li><strong>Additional Info:</strong> ${additional || 'N/A'}</li>
          </ul>
          <p style="margin-top:20px;">We will contact you shortly to finalize the details.</p>
          <p style="color:#6c757d;font-size:14px;">- Hitaishi Wedding Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: 'Booking submitted successfully. Confirmation email sent!',
      bookingId: result.insertId
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: 'Booking submission failed' });
  }
});

// ✅ GET booking by ID
router.get('/get_booking/:id', async (req, res) => {
  const bookingId = req.params.id;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM decoration_bookings WHERE id = ?',
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ message: 'Database error' });
  }
});

module.exports = router;
