const express = require('express');
const pool = require('../db');
const auth = require('../middlewares/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  // Ejemplo: traer datos del usuario
  const [user] = await pool.query('SELECT id, username FROM users WHERE id = ?', [req.user.id]);
  res.json({ user: user[0] });
});

module.exports = router;