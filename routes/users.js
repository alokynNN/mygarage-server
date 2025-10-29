const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

const adminCheck = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT is_admin, perm_manage_users FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (!users[0]?.is_admin && !users[0]?.perm_manage_users) {
      return res.status(403).json({ error: 'Admin access or manage users permission required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

router.get('/', authMiddleware, adminCheck, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, username, email, is_admin, 
             perm_manage_users, perm_edit_inventory, 
             perm_delete_inventory, perm_add_inventory, 
             perm_manage_categories, perm_view_logs, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/', authMiddleware, adminCheck, async (req, res) => {
  try {
    const { username, email, password, is_admin, permissions } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(`
      INSERT INTO users (
        username, email, password_hash, is_admin,
        perm_manage_users, perm_add_inventory, perm_edit_inventory,
        perm_delete_inventory, perm_manage_categories, perm_view_logs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username,
      email,
      hashedPassword,
      is_admin ? 1 : 0,
      permissions?.manage_users ? 1 : 0,
      permissions?.add_inventory ? 1 : 0,
      permissions?.edit_inventory ? 1 : 0,
      permissions?.delete_inventory ? 1 : 0,
      permissions?.manage_categories ? 1 : 0,
      permissions?.view_logs ? 1 : 0
    ]);

    res.json({ 
      success: true, 
      userId: result.insertId,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', authMiddleware, adminCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, is_admin, permissions } = req.body;
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot modify own account here. Use settings page.' });
    }
    
    const [targetUser] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [id]);
    if (targetUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (targetUser[0]?.is_admin) {
      return res.status(403).json({ error: 'Cannot modify admin accounts' });
    }
    
    if (username || email) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || '', email || '', id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
    }
    
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
    }
    if (typeof is_admin !== 'undefined') {
      updates.push('is_admin = ?');
      values.push(is_admin ? 1 : 0);
    }
    if (permissions) {
      updates.push('perm_manage_users = ?');
      values.push(permissions.manage_users ? 1 : 0);
      updates.push('perm_add_inventory = ?');
      values.push(permissions.add_inventory ? 1 : 0);
      updates.push('perm_edit_inventory = ?');
      values.push(permissions.edit_inventory ? 1 : 0);
      updates.push('perm_delete_inventory = ?');
      values.push(permissions.delete_inventory ? 1 : 0);
      updates.push('perm_manage_categories = ?');
      values.push(permissions.manage_categories ? 1 : 0);
      updates.push('perm_view_logs = ?');
      values.push(permissions.view_logs ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.put('/:id/permissions', authMiddleware, adminCheck, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot modify own permissions' });
    }
    
    const [targetUser] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [id]);
    if (targetUser[0]?.is_admin) {
      return res.status(400).json({ error: 'Cannot modify admin permissions' });
    }
    
    await pool.query(`
      UPDATE users SET
        perm_manage_users = ?,
        perm_edit_inventory = ?,
        perm_delete_inventory = ?,
        perm_add_inventory = ?,
        perm_manage_categories = ?,
        perm_view_logs = ?
      WHERE id = ?
    `, [
      permissions.manage_users || false,
      permissions.edit_inventory || false,
      permissions.delete_inventory || false,
      permissions.add_inventory || false,
      permissions.manage_categories || false,
      permissions.view_logs || false,
      id
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

router.delete('/:id', authMiddleware, adminCheck, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete own account' });
    }
    
    const [user] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user[0]?.is_admin) {
      return res.status(400).json({ error: 'Cannot delete admin accounts' });
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;