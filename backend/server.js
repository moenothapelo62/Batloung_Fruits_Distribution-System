// Batloung Fruits Distribution Management System - Express server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.warn('WARNING: JWT_SECRET is missing or too short. Set a strong JWT_SECRET in .env');
}

const app = express();
app.disable('x-powered-by');
app.use(helmet());

// CLIENT_ORIGIN may be a single URL or a comma-separated list (e.g. local + production)
const allowedOrigins = (process.env.CLIENT_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.includes('*') ? '*' : allowedOrigins }));
app.use(express.json({ limit: '100kb' }));

// Slow down repeated login attempts
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Simple request logger
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/fruits',    require('./routes/fruits'));
app.use('/api/boxsizes',  require('./routes/boxsizes'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/vendors',   require('./routes/vendors'));
app.use('/api/stock',     require('./routes/stock'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/reports',   require('./routes/reports'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'Batloung Fruits API' }));

// 404
app.use((_req, res) => res.status(404).json({ message: 'Endpoint not found' }));

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with those details already exists' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'Cannot delete: this record is used by other records' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'A related record does not exist' });
  }
  if (err.code === 'ER_DATA_TOO_LONG' || err.code === 'WARN_DATA_TRUNCATED') {
    return res.status(400).json({ message: 'One or more fields contain invalid data' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Batloung Fruits API running on port ${PORT}`));
