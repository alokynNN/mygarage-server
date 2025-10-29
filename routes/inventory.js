const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

const checkPermission = (perm) => {
  return async (req, res, next) => {
    try {
      const [users] = await pool.query(
        `SELECT is_admin, ${perm} FROM users WHERE id = ?`,
        [req.user.id]
      );
      
      if (users[0]?.is_admin || users[0]?.[perm]) {
        return next();
      }
      
      res.status(403).json({ error: 'Permission denied' });
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

const generateItemId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const createLog = async (itemId, userId, actionType, quantityChange, quantityBefore, quantityAfter, description) => {
  try {
    await pool.query(
      'INSERT INTO inventory_logs (inventory_item_id, user_id, action_type, quantity_change, quantity_before, quantity_after, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [itemId, userId, actionType, quantityChange, quantityBefore, quantityAfter, description || '']
    );
  } catch (error) {
    console.error('Log creation error:', error);
  }
};

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT i.*, c.name as category_name, u.username as creator_name
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (search) {
      query += ' AND (i.name LIKE ? OR i.item_id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (category) {
      query += ' AND i.category_id = ?';
      params.push(category);
    }
    
    const [total] = await pool.query(
      query.replace('i.*, c.name as category_name, u.username as creator_name', 'COUNT(*) as count'),
      params
    );
    
    query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const [items] = await pool.query(query, params);
    
    res.json({
      items,
      total: total[0].count,
      page: parseInt(page),
      pages: Math.ceil(total[0].count / limit)
    });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

router.get('/:id/logs', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT is_admin, perm_view_logs FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!users[0]?.is_admin && !users[0]?.perm_view_logs) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const [logs] = await pool.query(`
      SELECT l.*, u.username
      FROM inventory_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.inventory_item_id = ?
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);
    
    const [total] = await pool.query(
      'SELECT COUNT(*) as count FROM inventory_logs WHERE inventory_item_id = ?',
      [id]
    );
    
    res.json({
      logs,
      total: total[0].count,
      page: parseInt(page),
      pages: Math.ceil(total[0].count / limit)
    });
  } catch (error) {
    console.error('Fetch logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.post('/', authMiddleware, checkPermission('perm_add_inventory'), async (req, res) => {
  try {
    const { name, category_id, quantity, description, image_url } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Item name required' });
    }
    
    let itemId = generateItemId();
    let unique = false;
    let attempts = 0;
    
    while (!unique && attempts < 10) {
      const [existing] = await pool.query(
        'SELECT id FROM inventory_items WHERE item_id = ?',
        [itemId]
      );
      
      if (existing.length === 0) {
        unique = true;
      } else {
        itemId = generateItemId();
        attempts++;
      }
    }
    
    const qty = parseInt(quantity) || 0;
    
    const [result] = await pool.query(
      'INSERT INTO inventory_items (item_id, name, category_id, quantity, description, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [itemId, name, category_id || null, qty, description || '', image_url || null, req.user.id]
    );
    
    await createLog(
      result.insertId,
      req.user.id,
      'create',
      qty,
      0,
      qty,
      `Item created with initial quantity of ${qty}`
    );
    
    res.json({ success: true, id: result.insertId, item_id: itemId });
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

router.put('/:id', authMiddleware, checkPermission('perm_edit_inventory'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, quantity, description, image_url } = req.body;
    
    const [current] = await pool.query('SELECT quantity FROM inventory_items WHERE id = ?', [id]);
    const oldQty = current[0]?.quantity || 0;
    const newQty = parseInt(quantity) || 0;
    
    await pool.query(
      'UPDATE inventory_items SET name = ?, category_id = ?, quantity = ?, description = ?, image_url = ? WHERE id = ?',
      [name, category_id || null, newQty, description || '', image_url || null, id]
    );
    
    if (oldQty !== newQty) {
      const change = newQty - oldQty;
      await createLog(
        id,
        req.user.id,
        'adjust',
        change,
        oldQty,
        newQty,
        `Quantity adjusted from ${oldQty} to ${newQty}`
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

router.put('/:id/adjust', authMiddleware, checkPermission('perm_edit_inventory'), async (req, res) => {
  try {
    const { id } = req.params;
    const { change, description } = req.body;
    
    if (!change || change === 0) {
      return res.status(400).json({ error: 'Change amount required' });
    }
    
    const [current] = await pool.query('SELECT quantity FROM inventory_items WHERE id = ?', [id]);
    if (!current[0]) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const oldQty = current[0].quantity;
    const newQty = Math.max(0, oldQty + parseInt(change));
    
    await pool.query('UPDATE inventory_items SET quantity = ? WHERE id = ?', [newQty, id]);
    
    const actionType = change > 0 ? 'add' : 'remove';
    await createLog(
      id,
      req.user.id,
      actionType,
      change,
      oldQty,
      newQty,
      description || `${change > 0 ? 'Added' : 'Removed'} ${Math.abs(change)} units`
    );
    
    res.json({ success: true, newQuantity: newQty });
  } catch (error) {
    console.error('Adjust inventory error:', error);
    res.status(500).json({ error: 'Failed to adjust quantity' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('perm_delete_inventory'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [item] = await pool.query('SELECT quantity, name FROM inventory_items WHERE id = ?', [id]);
    if (item[0]) {
      await createLog(
        id,
        req.user.id,
        'delete',
        -item[0].quantity,
        item[0].quantity,
        0,
        `Item "${item[0].name}" deleted`
      );
    }
    
    await pool.query('DELETE FROM inventory_items WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;