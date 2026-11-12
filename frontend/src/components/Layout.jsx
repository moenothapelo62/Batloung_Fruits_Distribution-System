import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconDashboard, IconFruits, IconProducts, IconBoxSizes, IconSuppliers,
  IconStock, IconOrders, IconVendors, IconReports
} from './Icons.jsx';
// Icons are now emoji/unicode-based for a mature, real look

const NAV_ITEMS_ADMIN = [
  { to: '/',          Icon: IconDashboard,  label: 'Dashboard',  exact: true },
  { to: '/fruits',    Icon: IconFruits,     label: 'Fruits' },
  { to: '/products',  Icon: IconProducts,   label: 'Products' },
  { to: '/boxsizes',  Icon: IconBoxSizes,   label: 'Box Sizes' },
  { to: '/suppliers', Icon: IconSuppliers,  label: 'Suppliers' },
  { to: '/stock',     Icon: IconStock,      label: 'Stock' },
  { to: '/orders',    Icon: IconOrders,     label: 'Orders' },
  { to: '/vendors',   Icon: IconVendors,    label: 'Vendors' },
  { to: '/reports',   Icon: IconReports,    label: 'Reports' },
];

const NAV_ITEMS_SALES = [
  { to: '/',         Icon: IconDashboard,  label: 'Dashboard', exact: true },
  { to: '/products', Icon: IconProducts,   label: 'Products' },
  { to: '/vendors',  Icon: IconVendors,    label: 'Vendors' },
  { to: '/orders',   Icon: IconOrders,     label: 'Orders' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); nav('/login'); };
  const items = isAdmin ? NAV_ITEMS_ADMIN : NAV_ITEMS_SALES;

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const pageName = items.find(i => isActive(i))?.label || 'Dashboard';

  return (
    <div className="shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        {/* Brand */}
        <div className="brand">
          <div className="brand-logo">
            <img
              src="/images/logo.jpg"
              alt="Batloung Fruits"
              onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:22px">🍏</span>'; }}
            />
          </div>
          <div className="brand-text">
            <div className="brand-name">Batloung Fruits</div>
            <div className="brand-tagline">Freshness You Can Trust</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {items.map(item => {
            const active = isActive(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={() => 'nav-item' + (active ? ' active' : '')}
              >
                <span className="nav-icon">
                  <item.Icon />
                </span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="user-chip">
            <img
              src="/images/avatar.jpg"
              alt={user?.name}
              className="user-chip-avatar"
              onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'Admin')}&background=0B2519&color=fff`}
            />
            <div className="user-chip-info">
              <div className="user-chip-name">{user?.name || 'Admin'}</div>
              <div className="user-chip-role">{user?.role || 'Administrator'}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <span style={{ fontSize: '15px', opacity: 0.8 }}>⇥</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <div className="content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-page-title">{pageName}</div>
          </div>
          <div className="topbar-right">
            <div className="topbar-notif" title="Notifications">
              <span style={{ fontSize: '17px', lineHeight: 1 }}>🔔</span>
              <span className="notif-dot"></span>
            </div>
            <div className="topbar-user">
              <img
                src="/images/avatar.jpg"
                alt={user?.name}
                className="topbar-avatar"
                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'A')}&background=0B2519&color=fff`}
              />
              <div>
                <div className="topbar-uname">{user?.name || 'Admin'}</div>
                <div className="topbar-urole">{user?.role || 'Administrator'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-wrap">
          <Outlet />
        </main>
      </div>
    </div>
  );
}