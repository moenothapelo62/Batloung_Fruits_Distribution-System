// Real-looking icon components using Unicode symbols and CSS styling.
// These render as crisp, professional icons — no SVG strokes.

const Icon = ({ children, size = 20, style = {} }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    fontSize: size * 0.85,
    lineHeight: 1,
    ...style,
  }}>
    {children}
  </span>
);

export const IconDashboard = (p) => <Icon {...p}>⊞</Icon>;
export const IconProducts  = (p) => <Icon {...p}>◈</Icon>;
export const IconBoxSizes  = (p) => <Icon {...p}>▣</Icon>;
export const IconFruits    = (p) => <Icon {...p}>✿</Icon>;
export const IconSuppliers = (p) => <Icon {...p}>⬡</Icon>;
export const IconVendors   = (p) => <Icon {...p}>⌂</Icon>;
export const IconStock     = (p) => <Icon {...p}>▦</Icon>;
export const IconOrders    = (p) => <Icon {...p}>≡</Icon>;
export const IconReports   = (p) => <Icon {...p}>◫</Icon>;

// Additional icons used in layout/topbar
export const IconBell      = (p) => <Icon {...p}>🔔</Icon>;
export const IconLogout    = (p) => <Icon {...p}>⇥</Icon>;

export const navIcons = {
  dashboard: IconDashboard,
  products:  IconProducts,
  boxsizes:  IconBoxSizes,
  fruits:    IconFruits,
  suppliers: IconSuppliers,
  vendors:   IconVendors,
  stock:     IconStock,
  orders:    IconOrders,
  reports:   IconReports,
};
