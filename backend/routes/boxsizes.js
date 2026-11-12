const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const BOX_SIZES = ['Small', 'Medium', 'Large'];

// GET /api/boxsizes  -> all box sizes plus how many products use each one
router.get('/', authenticate, async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*,
             (SELECT COUNT(*) FROM products p WHERE p.box_size_id = b.id) AS product_count
      FROM box_sizes b
      ORDER BY FIELD(b.name,'Small','Medium','Large')`);
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/boxsizes  (Administrator)
router.post('/', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { name, description = null } = req.body;
    if (!BOX_SIZES.includes(name)) {
      return res.status(400).json({ message: 'Box size must be Small, Medium or Large' });
    }
    const [result] = await pool.query(
      'INSERT INTO box_sizes (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That box size already exists' });
    next(e);
  }
});

// PUT /api/boxsizes/:id  (Administrator)
router.put('/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { name, description = null } = req.body;
    if (!BOX_SIZES.includes(name)) {
      return res.status(400).json({ message: 'Box size must be Small, Medium or Large' });
    }
    const [result] = await pool.query(
      'UPDATE box_sizes SET name = ?, description = ? WHERE id = ?',
      [name, description || null, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Box size not found' });
    res.json({ message: 'Box size updated' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That box size already exists' });
    next(e);
  }
});

// DELETE /api/boxsizes/:id  (Administrator) -- blocked while products use it
router.delete('/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const [[{ used }]] = await pool.query(
      'SELECT COUNT(*) AS used FROM products WHERE box_size_id = ?',
      [req.params.id]
    );
    if (used > 0) {
      return res.status(409).json({ message: `Box size is used by ${used} product(s) and cannot be deleted` });
    }
    const [result] = await pool.query('DELETE FROM box_sizes WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Box size not found' });
    res.json({ message: 'Box size deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
