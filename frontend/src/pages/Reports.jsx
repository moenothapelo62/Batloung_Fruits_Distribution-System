import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from 'recharts';
import api, { money } from '../api/client';
import PageHeader from '../components/PageHeader.jsx';

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

const PIE_COLORS = ['#F89820','#3a8c55','#1e40af','#5b21b6','#dc2626','#0891b2','#d97706','#7c3aed'];

const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #D9E5DC',
  fontSize: '12px',
  boxShadow: '0 8px 24px rgba(11,37,25,0.12)',
  background: '#fff',
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ ...tooltipStyle, padding: '10px 14px' }}>
        <div style={{ fontWeight: 700, color: '#0B2519', marginBottom: '4px', fontSize: '13px' }}>{label}</div>
        <div style={{ color: '#d97d0c', fontWeight: 600 }}>{money(payload[0]?.value)}</div>
      </div>
    );
  }
  return null;
};

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ ...tooltipStyle, padding: '10px 14px' }}>
        <div style={{ fontWeight: 600, color: '#6b8070', marginBottom: '4px', fontSize: '11px' }}>{label}</div>
        <div style={{ color: '#3a8c55', fontWeight: 700 }}>{money(payload[0]?.value)}</div>
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [byFruit,    setByFruit]    = useState([]);
  const [byVendor,   setByVendor]   = useState([]);
  const [byProvince, setByProvince] = useState([]);
  const [byDate,     setByDate]     = useState([]);
  const [stock,      setStock]      = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/sales-by-fruit').then(r => setByFruit(r.data)),
      api.get('/reports/sales-by-vendor').then(r => setByVendor(r.data)),
      api.get('/reports/purchases-by-province').then(r => setByProvince(r.data)),
      api.get('/reports/sales-by-date').then(r =>
        setByDate(r.data.map(d => ({ ...d, order_date: String(d.order_date).slice(0, 10) })))
      ),
      api.get('/reports/available-stock').then(r => setStock(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalRev    = byFruit.reduce((s, f) => s + Number(f.revenue || 0), 0);
  const totalBoxes  = byFruit.reduce((s, f) => s + Number(f.boxes_sold || 0), 0);
  const totalCost   = byProvince.reduce((s, p) => s + Number(p.cost || 0), 0);

  const EmptyChart = ({ icon, msg }) => (
    <div style={{ height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '40px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '13px' }}>{msg}</div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="📊 Analytics & Reports"
        subtitle="Comprehensive overview of sales, purchasing, and inventory"
        actions={
          <button className="btn-primary" onClick={() => window.print()}>
            🖨️ Export Report
          </button>
        }
      />

      {/* Summary cards */}
      <div className="summary-grid" style={{ marginBottom: '28px' }}>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg,#0B2519,#1d4b2f)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>Total Sales Revenue</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 800, color: '#FBB040' }}>{money(totalRev)}</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>From all completed orders</div>
        </div>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg,#1e40af,#2563eb)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>Total Boxes Sold</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 800, color: '#93c5fd' }}>{totalBoxes.toLocaleString()}</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Across all fruit types</div>
        </div>
        <div className="summary-card" style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '8px' }}>Total Purchase Cost</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '32px', fontWeight: 800, color: '#c4b5fd' }}>{money(totalCost)}</div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Paid to suppliers</div>
        </div>
      </div>

      {/* CHARTS ROW 1 - Revenue Trend & Province purchases */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="chart-panel">
          <div className="chart-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '8px', background: '#fef3c7', marginRight: '6px', fontSize: '14px' }}>📅</span>
            Revenue Trend Over Time
          </div>
          {byDate.length === 0
            ? <EmptyChart icon="📈" msg="No revenue trend data available yet" />
            : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={byDate} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F89820" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F89820" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaf2eb" vertical={false} />
                  <XAxis dataKey="order_date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b8070' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b8070' }} tickFormatter={v => `M${v}`} width={52} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#F89820" strokeWidth={3} fill="url(#revGrad)"
                    dot={{ r: 4, fill: '#F89820', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7, fill: '#3a8c55' }} />
                </AreaChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className="chart-panel">
          <div className="chart-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '8px', background: '#dcfce7', marginRight: '6px', fontSize: '14px' }}>🌍</span>
            Purchases by Province
          </div>
          {byProvince.length === 0
            ? <EmptyChart icon="🌍" msg="No provincial purchase data yet" />
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byProvince} barCategoryGap="25%" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaf2eb" vertical={false} />
                  <XAxis dataKey="province" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b8070' }} angle={-20} textAnchor="end" height={40} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b8070' }} tickFormatter={v => `M${v}`} width={52} />
                  <Tooltip
                    formatter={v => [money(v), 'Purchases']}
                    labelFormatter={l => l}
                    contentStyle={tooltipStyle}
                    cursor={{ fill: 'rgba(11,37,25,0.04)' }}
                  />
                  <Bar dataKey="cost" radius={[8, 8, 0, 0]} fill="url(#greenGrad)" barSize={28}>
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3a8c55" />
                        <stop offset="100%" stopColor="#1d4b2f" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* CHARTS ROW 2 - Revenue by fruit & pie chart */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="chart-panel">
          <div className="chart-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '8px', background: '#fef3c7', marginRight: '6px' }}>
              <img src="/images/mango.jpg" alt="" style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML = '🍋'; }} />
            </span>
            Revenue by Fruit Type
          </div>
          {byFruit.length === 0
            ? <EmptyChart icon="🍊" msg="No sales by fruit yet" />
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byFruit} barCategoryGap="25%" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaf2eb" vertical={false} />
                  <XAxis dataKey="fruit" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b8070', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b8070' }} tickFormatter={v => `M${v}`} width={52} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(11,37,25,0.04)' }} />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={40}>
                    {byFruit.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {byFruit.length > 0 ? (
          <div className="chart-panel">
            <div className="chart-title">
              <span style={{ marginRight: '6px' }}>🥧</span>
              Revenue Share by Fruit
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byFruit}
                  dataKey="revenue"
                  nameKey="fruit"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {byFruit.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={v => [money(v), 'Revenue']}
                  contentStyle={tooltipStyle}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  formatter={(value) => <span style={{ color: 'var(--text-sec)', fontWeight: 600 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-panel">
            <div className="chart-title">🥧 Revenue Share by Fruit</div>
            <EmptyChart icon="🥧" msg="Add orders to see revenue share" />
          </div>
        )}
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Top Fruits */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🏆 Top Selling Fruits</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fruit</th>
                <th>Boxes Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {byFruit.map((r, i) => (
                <tr key={r.fruit}>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '8px',
                      background: i === 0 ? '#fef3c7' : i === 1 ? '#f3f4f6' : i === 2 ? '#ffedd5' : 'var(--bg)',
                      fontWeight: 800, fontSize: '12px',
                      color: i === 0 ? '#92400e' : '#6b8070',
                    }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="fruit-cell">
                      <img
                        src={fruitImg(r.fruit)}
                        alt={r.fruit}
                        className="fruit-cell-img"
                        style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onError={e => e.target.src='/images/orange.jpg'}
                      />
                      <span className="cell-primary" style={{ fontWeight: 700 }}>{r.fruit}</span>
                    </div>
                  </td>
                  <td><span className="badge info">{r.boxes_sold} boxes</span></td>
                  <td className="fw-700 color-forest">{money(r.revenue)}</td>
                </tr>
              ))}
              {byFruit.length === 0 && (
                <tr><td colSpan={4}>
                  <div className="table-empty">
                    <div className="table-empty-icon">📊</div>
                    <div className="table-empty-msg">No sales data yet</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Vendors */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🏪 Top Street Vendors</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {byVendor.map((r, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${PIE_COLORS[i % PIE_COLORS.length]}22, ${PIE_COLORS[i % PIE_COLORS.length]}44)`,
                        border: `2px solid ${PIE_COLORS[i % PIE_COLORS.length]}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                      }}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(r.vendor || 'V')}&size=38&bold=true&format=png&background=${PIE_COLORS[i % PIE_COLORS.length].replace('#','')}&color=fff`}
                          alt={r.vendor}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <div>
                        <div className="cell-primary">{r.vendor}</div>
                        <div className="cell-sub">{r.business_name}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge ok">{r.orders} orders</span></td>
                  <td className="fw-700 color-forest">{money(r.revenue)}</td>
                </tr>
              ))}
              {byVendor.length === 0 && (
                <tr><td colSpan={3}>
                  <div className="table-empty">
                    <div className="table-empty-icon">🏪</div>
                    <div className="table-empty-msg">No vendor sales yet</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current Stock */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">📦 Current Available Stock</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {stock.filter(s => s.stock_quantity < 20).length > 0 && (
              <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
                ⚠️ {stock.filter(s => s.stock_quantity < 20).length} low-stock items
              </span>
            )}
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fruit</th>
              <th>Box Size</th>
              <th>Selling Price</th>
              <th>Stock Remaining</th>
              <th style={{ width: '180px' }}>Stock Level</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((r, i) => {
              const pct = Math.min(100, (r.stock_quantity / 200) * 100);
              const isLow = r.stock_quantity < 20;
              return (
                <tr key={i}>
                  <td>
                    <div className="fruit-cell">
                      <img
                        src={fruitImg(r.fruit || r.fruit_name)}
                        alt={r.fruit || r.fruit_name}
                        className="fruit-cell-img"
                        style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        onError={e => e.target.src='/images/orange.jpg'}
                      />
                      <span className="cell-primary" style={{ fontWeight: 700 }}>{r.fruit || r.fruit_name}</span>
                    </div>
                  </td>
                  <td><span className="badge box">{r.box_size}</span></td>
                  <td className="fw-700 color-forest">{money(r.selling_price)}</td>
                  <td style={{ color: isLow ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                    {r.stock_quantity} boxes
                    {isLow && <span className="badge danger" style={{ marginLeft: '6px', fontSize: '10px' }}>⚠️ Low</span>}
                  </td>
                  <td style={{ width: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'var(--bg-alt)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, borderRadius: '10px',
                          background: isLow
                            ? 'linear-gradient(90deg,#ef4444,#f97316)'
                            : 'linear-gradient(90deg,var(--leaf),var(--gold))',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '28px', textAlign: 'right' }}>{Math.round(pct)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {stock.length === 0 && (
              <tr><td colSpan={5}>
                <div className="table-empty">
                  <div className="table-empty-icon">📦</div>
                  <div className="table-empty-msg">No stock data available</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}