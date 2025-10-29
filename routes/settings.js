const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

const adminCheck = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT is_admin FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!users[0]?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, username, email, is_admin,
             perm_manage_users, perm_edit_inventory,
             perm_delete_inventory, perm_add_inventory,
             perm_manage_categories, created_at, last_login
      FROM users WHERE id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/registration', authMiddleware, adminCheck, async (req, res) => {
  try {
    const { enabled } = req.body;
    
    await pool.query(
      "UPDATE settings SET value = ? WHERE `key` = 'allow_registration'",
      [enabled ? 'true' : 'false']
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({ error: 'Failed to update registration setting' });
  }
});

router.put('/stock-threshold', authMiddleware, adminCheck, async (req, res) => {
  try {
    const { threshold } = req.body;
    
    if (!threshold || threshold < 0) {
      return res.status(400).json({ error: 'Invalid threshold value' });
    }
    
    await pool.query(
      "UPDATE settings SET value = ? WHERE `key` = 'low_stock_threshold'",
      [threshold.toString()]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({ error: 'Failed to update threshold' });
  }
});

router.put('/username', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [username, req.user.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    await pool.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, req.user.id]
    );
    
    res.json({ success: true, username });
  } catch (error) {
    console.error('Update username error:', error);
    res.status(500).json({ error: 'Failed to update username' });
  }
});

router.put('/email', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.user.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already taken' });
    }
    
    await pool.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [email, req.user.id]
    );
    
    res.json({ success: true, email });
  } catch (error) {
    console.error('Update email error:', error);
    res.status(500).json({ error: 'Failed to update email' });
  }
});

router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    const [users] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );
    
    const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password incorrect' });
    }
    
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, req.user.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    const [users] = await pool.query(
      'SELECT password_hash, is_admin FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users[0].is_admin) {
      return res.status(400).json({ error: 'Cannot delete admin account' });
    }
    
    const validPassword = await bcrypt.compare(password, users[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;