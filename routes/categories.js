const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

const checkPermission = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT is_admin, perm_manage_categories FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users[0]?.is_admin || users[0]?.perm_manage_categories) {
      return next();
    }
    
    res.status(403).json({ error: 'Permission denied' });
  } catch (error) {
    res.status(500).json({ error: 'Permission check failed' });
  }
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT c.*, u.username as creator_name,
             (SELECT COUNT(*) FROM inventory_items WHERE category_id = c.id) as item_count
      FROM categories c
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.name ASC
    `);
    
    res.json({ categories });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/', authMiddleware, checkPermission, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)',
      [name, description || '', req.user.id]
    );
    
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    console.error('Add category error:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

router.put('/:id', authMiddleware, checkPermission, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description || '', id]
    );
    
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', authMiddleware, checkPermission, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [items] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE category_id = ?',
      [id]
    );
    
    if (items[0].count > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${items[0].count} items` 
      });
    }
    
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;