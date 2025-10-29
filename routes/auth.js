const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

router.get('/config', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT value FROM settings WHERE `key` = 'allow_registration'"
    );
    
    const allowRegistration = rows[0]?.value === 'true';
    res.json({ allowRegistration });
  } catch (error) {
    console.error('Config fetch error:', error);
    res.status(500).json({ error: 'Server configuration error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const [settings] = await pool.query(
      "SELECT value FROM settings WHERE `key` = 'allow_registration'"
    );
    
    if (settings[0]?.value !== 'true') {
      return res.status(403).json({ error: 'Registration is disabled' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: result.insertId,
        username,
        email,
        is_admin: false,
        permissions: {
          manage_users: false,
          edit_inventory: false,
          delete_inventory: false,
          add_inventory: false,
          manage_categories: false
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [users] = await pool.query(
      `SELECT id, username, email, password_hash, is_admin,
       perm_manage_users, perm_edit_inventory, perm_delete_inventory,
       perm_add_inventory, perm_manage_categories
       FROM users WHERE username = ? OR email = ?`,
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        permissions: {
          manage_users: user.perm_manage_users,
          edit_inventory: user.perm_edit_inventory,
          delete_inventory: user.perm_delete_inventory,
          add_inventory: user.perm_add_inventory,
          manage_categories: user.perm_manage_categories
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;