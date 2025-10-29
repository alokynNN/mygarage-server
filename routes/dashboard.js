const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

router.get('/user', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, is_admin, perm_manage_users, perm_add_inventory, perm_edit_inventory, perm_delete_inventory, perm_manage_categories, perm_view_logs, created_at, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.get('/stock-alerts', authMiddleware, async (req, res) => {
  try {
    const [settings] = await pool.query(
      "SELECT value FROM settings WHERE `key` = 'low_stock_threshold'"
    );
    
    const threshold = parseInt(settings[0]?.value || 10);
    
    const [outOfStock] = await pool.query(`
      SELECT id, item_id, name, quantity, category_id
      FROM inventory_items
      WHERE quantity = 0
      ORDER BY name ASC
    `);
    
    const [lowStock] = await pool.query(`
      SELECT id, item_id, name, quantity, category_id
      FROM inventory_items
      WHERE quantity > 0 AND quantity <= ?
      ORDER BY quantity ASC, name ASC
    `, [threshold]);
    
    res.json({
      outOfStock,
      lowStock,
      threshold
    });
  } catch (error) {
    console.error('Stock alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch stock alerts' });
  }
});

module.exports = router;