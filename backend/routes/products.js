const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const JOIN = `
  SELECT p.id, p.fruit_id, p.box_size_id, p.selling_price, p.stock_quantity, p.is_active,
         f.name AS fruit_name, b.name AS box_size
  FROM products p
  JOIN fruits f    ON f.id = p.fruit_id
  JOIN box_sizes b ON b.id = p.box_size_id`;

// GET /api/products  (search by fruit, filter by box size)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { search = '', box_size_id } = req.query;
    let sql = `${JOIN} WHERE f.name LIKE ?`;
    const params = [`%${search}%`];
    if (box_size_id) { sql += ' AND p.box_size_id = ?'; params.push(box_size_id); }
    sql += ' ORDER BY f.name, FIELD(b.name,"Small","Medium","Large")';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/products/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${JOIN} WHERE p.id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// POST /api/products  (Administrator) - set price for a Fruit+Box combination
router.post('/', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { fruit_id, box_size_id, selling_price, stock_quantity = 0, is_active = 1 } = req.body;
    if (!fruit_id || !box_size_id) return res.status(400).json({ message: 'Fruit and box size are required' });
    if (!(selling_price > 0)) return res.status(400).json({ message: 'Selling price must be greater than zero' });
    if (!Number.isInteger(Number(stock_quantity)) || Number(stock_quantity) < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a whole number zero or greater' });
    }
    const [result] = await pool.query(
      'INSERT INTO products (fruit_id, box_size_id, selling_price, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?)',
      [fruit_id, box_size_id, selling_price, stock_quantity, is_active ? 1 : 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That fruit + box size product already exists' });
    next(e);
  }
});

// PUT /api/products/:id  (Administrator)
router.put('/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { selling_price, stock_quantity, is_active } = req.body;
    if (selling_price != null && !(selling_price > 0)) {
      return res.status(400).json({ message: 'Selling price must be greater than zero' });
    }
    if (stock_quantity == null || !Number.isInteger(Number(stock_quantity)) || Number(stock_quantity) < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a whole number zero or greater' });
    }
    const [result] = await pool.query(
      'UPDATE products SET selling_price = ?, stock_quantity = ?, is_active = ? WHERE id = ?',
      [selling_price, stock_quantity, is_active ? 1 : 0, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated' });
  } catch (e) { next(e); }
});

// DELETE /api/products/:id  (Administrator)
router.delete('/:id', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
