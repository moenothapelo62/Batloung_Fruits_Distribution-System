import { useEffect, useState } from 'react';
import api, { money } from '../api/client';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import { isPositiveInt, isNonNegativeNumber, isDate, today } from '../utils/validators';

const fruitImg = (name) => {
  if (!name) return '/images/orange.jpg';
  const n = name.toLowerCase();
  if (n.includes('apple'))      return '/images/apple.jpg';
  if (n.includes('banana'))     return '/images/banana.jpg';
  if (n.includes('orange'))     return '/images/orange.jpg';
  if (n.includes('grape'))      return '/images/grapes.jpg';
  if (n.includes('mango'))      return '/images/mango.jpg';
  if (n.includes('avocado'))    return '/images/avocado.jpg';
  if (n.includes('watermelon')) return '/images/watermelon.jpg';
  if (n.includes('pineapple'))  return '/images/pineapple.jpg';
  return '/images/orange.jpg';
};

export default function Stock() {
  const [stock, setStock]         = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts]   = useState([]);
  const [modal, setModal]         = useState(false);
  const [form, setForm]           = useState({ supplier_id: '', product_id: '', quantity: '', unit_cost: '', purchase_date: today() });
  const [err, setErr]             = useState('');
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'purchases'

  const load = () => {
    api.get('/stock').then(r => setStock(r.data)).catch(() => {});
    api.get('/stock/purchases').then(r => setPurchases(r.data)).catch(() => {});
  };
  useEffect(() => {
    load();
    api.get('/suppliers').then(r => setSuppliers(r.data)).catch(() => {});
    api.get('/products').then(r => setProducts(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    if (!form.supplier_id) return setErr('Please select a supplier');
    if (!form.product_id) return setErr('Please select a product');
    if (!isPositiveInt(form.quantity)) return setErr('Quantity must be a whole number greater than zero');
    if (!isNonNegativeNumber(form.unit_cost)) return setErr('Unit cost must be zero or more');
    if (!isDate(form.purchase_date)) return setErr('Purchase date must be in YYYY-MM-DD format');
    try {
      await api.post('/stock', form);
      setModal(false);
      setForm({ supplier_id: '', product_id: '', quantity: '', unit_cost: '', purchase_date: today() });
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Save failed'); }
  };

  const totalStock = stock.reduce((sum, s) => sum + Number(s.stock_quantity || 0), 0);
  const lowStock   = stock.filter(s => s.stock_quantity < 20);

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0B2519 0%, #1d4b2f 50%, #3a8c55 100%)',
        borderRadius: '20px', padding: '36px 48px', marginBottom: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        gap: '24px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(11,37,25,0.25)',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/images/warehouse_stock.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(248,152,32,0.2)', border: '1px solid rgba(248,152,32,0.35)',
            color: '#FBB040', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
            textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', marginBottom: '12px',
          }}>
            Warehouse Inventory
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '30px', fontWeight: 800,
            color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '8px' }}>
            Stock Management
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', maxWidth: '400px' }}>
            {totalStock.toLocaleString()} boxes available across {stock.length} product lines
          </p>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn-primary" onClick={() => { setErr(''); setModal(true); }} style={{ padding: '12px 24px', fontSize: '14px' }}>
            + Record Incoming Stock
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'Product Lines',   value: stock.length,      icon: '📦', color: 'blue' },
          { label: 'Total Boxes',     value: totalStock,        icon: '🗃️', color: 'green' },
          { label: 'Low Stock Items', value: lowStock.length,   icon: '⚠️', color: 'orange' },
          { label: 'Purchases Logged',value: purchases.length,  icon: '📋', color: 'purple' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ flex: 1, minWidth: '190px', padding: '18px 20px' }}>
            <div className={`stat-icon-wrap ${c.color}`} style={{ width: 40, height: 40, fontSize: 18 }}>{c.icon}</div>
            <div className="stat-value" style={{ fontSize: '24px' }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{
          background: 'var(--warn-bg)', border: '1.5px solid var(--gold)', borderRadius: 'var(--r-md)',
          padding: '14px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--warn-txt)', fontSize: '14px' }}>
              {lowStock.length} product{lowStock.length > 1 ? 's' : ''} running low on stock
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {lowStock.map(s => s.fruit_name).join(', ')} — less than 20 boxes remaining
            </div>
          </div>
          <button className="btn-primary" style={{ marginLeft: 'auto', fontSize: '13px', padding: '8px 16px' }}
            onClick={() => { setErr(''); setModal(true); }}>
            Restock Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="pill-tabs">
        <button className={`pill-tab ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>
          📦 Available Stock
        </button>
        <button className={`pill-tab ${activeTab === 'purchases' ? 'active' : ''}`} onClick={() => setActiveTab('purchases')}>
          📋 Purchase History
        </button>
      </div>

      {/* STOCK TABLE */}
      {activeTab === 'stock' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fruit</th>
                <th>Box Size</th>
                <th>Selling Price</th>
                <th>Available</th>
                <th>Stock Level</th>
              </tr>
            </thead>
            <tbody>
              {stock.map(s => {
                const pct = Math.min(100, (s.stock_quantity / 200) * 100);
                const isLow = s.stock_quantity < 20;
                return (
                  <tr key={s.product_id}>
                    <td>
                      <div className="fruit-cell">
                        <img
                          src={fruitImg(s.fruit_name)}
                          alt={s.fruit_name}
                          className="fruit-cell-img"
                          onError={e => e.target.src = '/images/orange.jpg'}
                        />
                        <div>
                          <div className="fruit-cell-name">{s.fruit_name}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge box">{s.box_size}</span></td>
                    <td className="fw-700 color-forest">{money(s.selling_price)}</td>
                    <td className={isLow ? 'low-stock' : 'fw-700'}>
                      {s.stock_quantity} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '12px' }}>boxes</span>
                      {isLow && <span className="badge danger" style={{ marginLeft: '6px', fontSize: '10px' }}>Low</span>}
                    </td>
                    <td style={{ width: '180px' }}>
                      <div style={{ height: '8px', background: 'var(--bg-alt)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: '10px',
                          background: isLow
                            ? 'linear-gradient(90deg,#ef4444,#f97316)'
                            : 'linear-gradient(90deg,var(--leaf),var(--gold))',
                          transition: 'width 600ms ease'
                        }} />
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', textAlign: 'right' }}>{pct.toFixed(0)}%</div>
                    </td>
                  </tr>
                );
              })}
              {stock.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🗃️</div>
                    <div className="table-empty-msg">No stock recorded yet</div>
                    <div className="table-empty-sub">Record incoming stock to get started</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PURCHASES TABLE */}
      {activeTab === 'purchases' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier</th>
                <th>Fruit / Product</th>
                <th>Quantity</th>
                <th>Unit Cost</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td className="cell-muted">{String(p.purchase_date).slice(0, 10)}</td>
                  <td className="cell-primary">{p.supplier_name}</td>
                  <td>
                    <div className="fruit-cell">
                      <img src={fruitImg(p.fruit_name)} alt={p.fruit_name} className="fruit-cell-img-sm" onError={e => e.target.src='/images/orange.jpg'} />
                      <span>{p.fruit_name}</span>
                    </div>
                  </td>
                  <td>{p.quantity} <span className="text-sm color-muted">boxes</span></td>
                  <td>{money(p.unit_cost)}</td>
                  <td className="fw-700 color-forest">{money(p.unit_cost * p.quantity)}</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="table-empty">
                    <div className="table-empty-icon">📋</div>
                    <div className="table-empty-msg">No purchases recorded yet</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title="📦 Record Incoming Stock"
          onClose={() => setModal(false)}
          footer={<><button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn-primary" onClick={save}>💾 Save Record</button></>}
        >
          {err && <div className="form-error">⚠️ {err}</div>}
          <label>Supplier
            <select value={form.supplier_id} onChange={e => setForm({ ...form, supplier_id: e.target.value })}>
              <option value="">Select supplier…</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.province})</option>)}
            </select>
          </label>
          <label>Product (Fruit + Box Size)
            <select value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })}>
              <option value="">Select product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.fruit_name} — {p.box_size}</option>)}
            </select>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>Quantity (boxes)
              <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
            </label>
            <label>Unit Cost (M)
              <input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({ ...form, unit_cost: e.target.value })} placeholder="0.00" />
            </label>
          </div>
          <label>Purchase Date
            <input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} />
          </label>
          {form.quantity && form.unit_cost && (
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: '12px 16px', textAlign: 'center', border: '1.5px solid var(--border)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL COST</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest)', fontFamily: 'Outfit,sans-serif' }}>
                {money(Number(form.quantity) * Number(form.unit_cost))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}