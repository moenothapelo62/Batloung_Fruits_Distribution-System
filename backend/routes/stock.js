const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/stock  (Administrator) -> current available stock per product
router.get('/', authenticate, authorize('Administrator'), async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id AS product_id, f.name AS fruit_name, b.name AS box_size,
             p.selling_price, p.stock_quantity, p.is_active
      FROM products p
      JOIN fruits f    ON f.id = p.fruit_id
      JOIN box_sizes b ON b.id = p.box_size_id
      ORDER BY f.name, FIELD(b.name,'Small','Medium','Large')`);
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/stock  -> record incoming stock (a purchase) and auto-update stock
// body: { supplier_id, product_id, quantity, unit_cost, purchase_date }
router.post('/', authenticate, authorize('Administrator'), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { supplier_id, product_id, quantity, unit_cost = 0, purchase_date } = req.body;
    if (!supplier_id || !product_id) return res.status(400).json({ message: 'Supplier and product are required' });
    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Quantity must be a whole number greater than zero' });
    }
    if (Number(unit_cost) < 0) return res.status(400).json({ message: 'Unit cost cannot be negative' });
    if (purchase_date && !/^\d{4}-\d{2}-\d{2}$/.test(purchase_date)) {
      return res.status(400).json({ message: 'Purchase date must be in YYYY-MM-DD format' });
    }
    const [[supplier]] = await conn.query('SELECT id FROM suppliers WHERE id = ?', [supplier_id]);
    if (!supplier) return res.status(400).json({ message: 'Selected supplier does not exist' });
    const [[product]] = await conn.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(400).json({ message: 'Selected product does not exist' });

    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO purchases (supplier_id, product_id, quantity, unit_cost, purchase_date) VALUES (?,?,?,?,?)',
      [supplier_id, product_id, quantity, unit_cost, purchase_date || new Date().toISOString().slice(0,10)]
    );
    await conn.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, product_id]);
    await conn.commit();
    res.status(201).json({ message: 'Stock recorded and updated' });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

// GET /api/stock/purchases  (Administrator) -> purchase history
router.get('/purchases', authenticate, authorize('Administrator'), async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT pu.id, pu.quantity, pu.unit_cost, pu.purchase_date,
             s.name AS supplier_name, s.province,
             f.name AS fruit_name, b.name AS box_size
      FROM purchases pu
      JOIN suppliers s ON s.id = pu.supplier_id
      JOIN products  p ON p.id = pu.product_id
      JOIN fruits    f ON f.id = p.fruit_id
      JOIN box_sizes b ON b.id = p.box_size_id
      ORDER BY pu.purchase_date DESC, pu.id DESC`);
    res.json(rows);
  } catch (e) { next(e); }
});

// PUT /api/stock/:productId  -> directly set a product's stock quantity
router.put('/:productId', authenticate, authorize('Administrator'), async (req, res, next) => {
  try {
    const { stock_quantity } = req.body;
    if (stock_quantity == null || stock_quantity < 0) return res.status(400).json({ message: 'Invalid stock quantity' });
    const [result] = await pool.query('UPDATE products SET stock_quantity = ? WHERE id = ?', [stock_quantity, req.params.productId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Stock updated' });
  } catch (e) { next(e); }
});

module.exports = router;
