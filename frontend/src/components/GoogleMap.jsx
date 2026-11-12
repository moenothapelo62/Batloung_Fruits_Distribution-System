import Modal from './Modal.jsx';

export const googleMapsQuery = (parts) =>
  parts.filter(Boolean).map(part => String(part).trim()).filter(Boolean).join(', ');

export const googleMapsUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const googleMapsEmbedUrl = (query) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;

export function MapLink({ query, children, className = 'map-link', title = 'Open in Google Maps' }) {
  if (!query) return <span>{children}</span>;
  return (
    <a
      className={className}
      href={googleMapsUrl(query)}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </a>
  );
}

export function GoogleMapModal({ title, query, onClose }) {
  if (!query) return null;
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <a
          className="btn-primary"
          href={googleMapsUrl(query)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Open in Google Maps
        </a>
      }
    >
      <iframe
        title={title}
        src={googleMapsEmbedUrl(query)}
        width="100%"
        height="360"
        style={{ border: 0, borderRadius: 'var(--r-md)', display: 'block' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'right' }}>
        Map data from Google Maps
      </p>
    </Modal>
  );
}

export const vendorMapQuery = (vendor) =>
  googleMapsQuery([vendor?.location, 'Maseru', 'Lesotho']);

export const supplierMapQuery = (supplier) =>
  googleMapsQuery([supplier?.address, supplier?.province, 'South Africa']);
