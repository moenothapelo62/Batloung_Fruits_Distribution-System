import { useEffect, useState } from 'react';
import api from '../api/client';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import { isRequired } from '../utils/validators';

const BOX_SIZES = ['Small', 'Medium', 'Large'];

const BOX_META = {
  Small:  { icon: '📦', color: 'green',  blurb: 'Compact box for single-fruit street sales' },
  Medium: { icon: '🗃️', color: 'orange', blurb: 'Standard box for everyday vendor orders' },
  Large:  { icon: '🚚', color: 'blue',   blurb: 'Bulk box for high-volume vendor orders' },
};

const blank = { name: '', description: '' };

export default function BoxSizes() {
  const [rows, setRows] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState('');

  const load = () => api.get('/boxsizes').then(r => setRows(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openAdd = () => {
    const missing = BOX_SIZES.find(n => !rows.some(r => r.name === n)) || '';
    setForm({ ...blank, name: missing });
    setErr('');
    setModal({ mode: 'add' });
  };
  const openEdit = (b) => {
    setForm({ name: b.name, description: b.description || '' });
    setErr('');
    setModal({ mode: 'edit', id: b.id });
  };

  const save = async () => {
    if (!BOX_SIZES.includes(form.name)) return setErr('Box size must be Small, Medium or Large');
    if (form.description.length > 255) return setErr('Description must be 255 characters or fewer');
    try {
      if (modal.mode === 'add') await api.post('/boxsizes', form);
      else await api.put(`/boxsizes/${modal.id}`, form);
      setModal(null);
      load();
    } catch (e) { setErr(e.response?.data?.message || 'Save failed'); }
  };

  const remove = async (b) => {
    if (!confirm(`Delete the ${b.name} box size?`)) return;
    try {
      await api.delete(`/boxsizes/${b.id}`);
      load();
    } catch (e) { alert(e.response?.data?.message || 'Could not delete box size'); }
  };

  const totalProducts = rows.reduce((sum, b) => sum + Number(b.product_count || 0), 0);
  const missing = BOX_SIZES.filter(n => !rows.some(r => r.name === n));

  return (
    <div>
      <PageHeader
        title="Box Size Management"
        subtitle="Maintain the three standard Batloung Fruits box sizes used by every product"
        actions={missing.length > 0 && <button className="btn-primary" onClick={openAdd}>+ Add Box Size</button>}
      />

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'Box Sizes', value: rows.length, icon: '🗃️', color: 'green', sub: 'Small, Medium & Large' },
          { label: 'Product Lines', value: totalProducts, icon: '📦', color: 'blue', sub: 'Using a box size' },
          { label: 'Missing Sizes', value: missing.length, icon: '⚠️', color: 'orange', sub: missing.length ? missing.join(', ') : 'All standard sizes present' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ flex: 1, minWidth: '190px', padding: '20px 22px' }}>
            <div className={`stat-icon-wrap ${c.color}`} style={{ width: 42, height: 42, fontSize: 19 }}>{c.icon}</div>
            <div className="stat-value" style={{ fontSize: '26px', marginTop: '8px' }}>{c.value}</div>
            <div className="stat-label">{c.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Box Size</th>
              <th>Description</th>
              <th>Products Using</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(b => {
              const meta = BOX_META[b.name] || { icon: '📦', color: 'green', blurb: '' };
              return (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className={`stat-icon-wrap ${meta.color}`} style={{ width: 42, height: 42, fontSize: 19 }}>{meta.icon}</div>
                      <div>
                        <div className="cell-primary">{b.name}</div>
                        <div className="cell-sub">{meta.blurb}</div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-muted">{b.description || '—'}</td>
                  <td>
                    <span className="badge box">{b.product_count} product{b.product_count === 1 ? '' : 's'}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-icon" onClick={() => openEdit(b)} title="Edit">✏️</button>
                      <button
                        className="btn-icon danger"
                        onClick={() => remove(b)}
                        title={b.product_count > 0 ? 'Cannot delete a box size used by products' : 'Delete'}
                        disabled={b.product_count > 0}
                        style={{ opacity: b.product_count > 0 ? 0.35 : 1 }}
                      >🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={4}>
                <div className="table-empty">
                  <div className="table-empty-icon">🗃️</div>
                  <div className="table-empty-msg">No box sizes found</div>
                  <div className="table-empty-sub">Add Small, Medium and Large to start creating products</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={modal.mode === 'add' ? '🗃️ Add Box Size' : '✏️ Edit Box Size'}
          onClose={() => setModal(null)}
          footer={<><button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn-primary" onClick={save}>💾 Save Box Size</button></>}
        >
          {err && <div className="form-error">⚠️ {err}</div>}
          <label>Box Size
            <select
              value={form.name}
              disabled={modal.mode === 'edit'}
              onChange={e => setForm({ ...form, name: e.target.value })}
            >
              <option value="">Select box size…</option>
              {BOX_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label>Description
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe how this box size is used…"
            />
          </label>
          {modal.mode === 'edit' && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Box size names are fixed by the business rules. You can still update the description.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
