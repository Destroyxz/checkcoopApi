const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!rows.length) return res.status(401).json({ message: 'Usuario no encontrado' });
  const user = rows[0];
  if (!await bcrypt.compare(password, user.password_hash))
    return res.status(401).json({ message: 'Credenciales inválidas' });
  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
  res.status(201).json({ message: 'Usuario creado' });
});

module.exports = router;