import { useEffect, useState } from 'react';
import api, { money } from '../api/client';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isPositiveNumber, isNonNegativeInt } from '../utils/validators';

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

export default function Products() {
  const { isAdmin } = useAuth();
  const [rows, setRows]         = useState([]);
  const [fruits, setFruits]     = useState([]);
  const [boxes, setBoxes]       = useState([]);
  const [search, setSearch]     = useState('');
  const [boxFilter, setBoxFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [err, setErr]           = useState('');
  const [view, setView]         = useState('cards'); // 'cards' | 'table'

  const load = () => api.get('/products', { params: { search, box_size_id: boxFilter } }).then(r => setRows(r.data)).catch(() => {});
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, boxFilter]);
  useEffect(() => {
    if (isAdmin) {
      api.get('/fruits', { params: { active: 'true' } }).then(r => setFruits(r.data)).catch(() => {});
    }
    api.get('/boxsizes').then(r => setBoxes(r.data)).catch(() => {});
  }, [isAdmin]);

  const openAdd  = () => { setForm({ fruit_id: '', box_size_id: '', selling_price: '', stock_quantity: 0, is_active: 1 }); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (p) => { setForm(p); setErr(''); setModal({ mode: 'edit', id: p.id }); };

  const save = async () => {
    if (modal.mode === 'add' && !form.fruit_id) return setErr('Please select a fruit');
    if (modal.mode === 'add' && !form.box_size_id) return setErr('Please select a box size');
    if (!isPositiveNumber(form.selling_price)) return setErr('Selling price must be greater than zero');
    if (!isNonNegativeInt(form.stock_quantity)) return setErr('Stock quantity must be a whole number of zero or more');
    try {
      if (modal.mode === 'add') await api.post('/products', form);
      else await api.put(`/products/${modal.id}`, form);
      setModal(null); load();
    } catch (e) { setErr(e.response?.data?.message || 'Save failed'); }
  };
  const remove = async (id) => {
    if (confirm('Delete this product configuration?')) { await api.delete(`/products/${id}`); load(); }
  };

  const filtered = rows.filter(r => {
    if (statusFilter === 'active')   return r.is_active;
    if (statusFilter === 'inactive') return !r.is_active;
    if (statusFilter === 'low')      return r.stock_quantity < 20;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Products Catalogue"
        subtitle="Fruit &amp; box-size configurations with Maloti pricing"
        actions={isAdmin && <button className="btn-primary" onClick={openAdd}>+ Add Product</button>}
      />

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'Total Products',    value: rows.length,                           icon: '📦', color: 'blue' },
          { label: 'Active Products',   value: rows.filter(r=>r.is_active).length,    icon: '✅', color: 'green' },
          { label: 'Low Stock (< 20)',  value: rows.filter(r=>r.stock_quantity<20).length, icon: '⚠️', color: 'orange' },
          { label: 'Box Sizes',         value: boxes.length,                          icon: '🗃️', color: 'purple' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ flex: 1, minWidth: '190px', padding: '18px 20px' }}>
            <div className={`stat-icon-wrap ${c.color}`} style={{ width: 40, height: 40, fontSize: 18 }}>{c.icon}</div>
            <div className="stat-value" style={{ fontSize: '24px' }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
          <input className="search" style={{ paddingLeft: '36px' }} placeholder="Search by fruit…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={boxFilter} onChange={e => setBoxFilter(e.target.value)}>
          <option value="">All box sizes</option>
          {boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
          <option value="low">Low stock</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button className="btn-ghost" onClick={() => setView('cards')}
            style={{ padding: '9px 14px', ...(view==='cards' ? {background:'var(--forest)',color:'#fff',borderColor:'var(--forest)'} : {}) }}>
            ⊞ Cards
          </button>
          <button className="btn-ghost" onClick={() => setView('table')}
            style={{ padding: '9px 14px', ...(view==='table' ? {background:'var(--forest)',color:'#fff',borderColor:'var(--forest)'} : {}) }}>
            ☰ Table
          </button>
        </div>
      </div>

      {/* CARDS VIEW */}
      {view === 'cards' && (
        <div className="product-cards">
          {filtered.map(p => (
            <div key={p.id} className="product-card">
              <img
                src={fruitImg(p.fruit_name)}
                alt={p.fruit_name}
                className="product-card-img"
                style={{ height: '160px', objectFit: 'cover', objectPosition: 'center' }}
                onError={e => e.target.src = '/images/orange.jpg'}
              />
              <div className="product-card-body">
                <div className="product-card-name">{p.fruit_name}</div>
                <div className="product-card-sub">
                  <span className="badge box" style={{ fontSize: '11px' }}>{p.box_size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div className="product-price">{money(p.selling_price)}</div>
                  <span className={p.stock_quantity < 20 ? 'badge danger' : 'badge ok'} style={{ fontSize: '11px' }}>
                    {p.stock_quantity < 20 ? '⚠️ ' : ''}{p.stock_quantity} boxes
                  </span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-alt)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{
                    height: '100%', borderRadius: '10px',
                    background: p.stock_quantity < 20 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,var(--leaf),var(--gold))',
                    width: `${Math.min(100, (p.stock_quantity / 200) * 100)}%`
                  }} />
                </div>
                <div className="product-card-footer">
                  <span className={`badge ${p.is_active ? 'ok' : 'off'}`}>{p.is_active ? '● Active' : '○ Inactive'}</span>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
                      <button className="btn-icon danger" onClick={() => remove(p.id)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="table-empty" style={{ gridColumn: '1/-1' }}>
              <div className="table-empty-icon">📦</div>
              <div className="table-empty-msg">No products found</div>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fruit</th>
                <th>Box Size</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Status</th>
                {isAdmin && <th style={{ width: 100 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="fruit-cell">
                      <img src={fruitImg(p.fruit_name)} alt={p.fruit_name} className="fruit-cell-img" onError={e => e.target.src='/images/orange.jpg'} />
                      <span className="cell-primary">{p.fruit_name}</span>
                    </div>
                  </td>
                  <td><span className="badge box">{p.box_size}</span></td>
                  <td className="fw-700 color-forest">{money(p.selling_price)}</td>
                  <td className={p.stock_quantity < 20 ? 'low-stock' : ''}>
                    {p.stock_quantity} <span className="text-sm color-muted">boxes</span>
                  </td>
                  <td><span className={`badge ${p.is_active ? 'ok' : 'off'}`}>{p.is_active ? '● Active' : '○ Inactive'}</span></td>
                  {isAdmin && (
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
                        <button className="btn-icon danger" onClick={() => remove(p.id)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="table-empty">
                    <div className="table-empty-icon">📦</div>
                    <div className="table-empty-msg">No products found</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'add' ? '📦 Add Product' : '✏️ Edit Product'}
          onClose={() => setModal(null)}
          footer={<><button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>💾 Save</button></>}
        >
          {err && <div className="form-error">⚠️ {err}</div>}
          {modal.mode === 'add' && (
            <>
              <label>Fruit
                <select value={form.fruit_id} onChange={e => setForm({ ...form, fruit_id: e.target.value })}>
                  <option value="">Select fruit…</option>
                  {fruits.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label>Box Size
                <select value={form.box_size_id} onChange={e => setForm({ ...form, box_size_id: e.target.value })}>
                  <option value="">Select box size…</option>
                  {boxes.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
            </>
          )}
          <label>Selling Price (Maloti — M)
            <input type="number" step="0.01" value={form.selling_price} onChange={e => setForm({ ...form, selling_price: e.target.value })} placeholder="0.00" />
          </label>
          <label>Stock Quantity (boxes)
            <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} />
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={!!form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })} />
            <span>Active — available for ordering</span>
          </label>
        </Modal>
      )}
    </div>
  );
}
