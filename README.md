# Batloung Fruits - Distribution Management System
## Group Members

| 
| 1  Thapelo Moeno  901020404
| 2  Liteboho Matiase  901020413 
| 3  Karabo Anna Noka  901020421 
| 4  Tsokoliso Makompo  901021267 
| 5 Relebohile Makoa 901020405 
| 6  Kekeletso Rakheane  901020411 
| 7  Mamakakamela Tabitha Makhaba  901020407

A full-stack web application for **DIWA2110 - Web Application Development**.

Batloung Fruits buys fruit from suppliers across the nine South African provinces and sells it to street vendors in Maseru in Small, Medium and Large boxes.

> Currency throughout the system is **Maloti (M / LSL)**.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Recharts |
| Backend | Node.js, Express.js REST API |
| Database | MySQL (mysql2) |
| Auth | JWT, bcrypt, role-based access control (Administrator / Sales) |
| Security | Helmet, CORS allow-list, login rate limiting |

## Project Structure

```
batloung-fruits/
|-- database/        schema.sql (DDL), seed.sql (sample data), ERD.md
|-- backend/         Express REST API
|   |-- config/db.js  MySQL connection pool
|   |-- middleware/   JWT auth + RBAC
|   |-- routes/       auth, fruits, boxsizes, products, suppliers,
|   |                 vendors, stock, orders, reports
|   |-- tests/        live API integration test
|   |-- seed.js       writes real bcrypt password hashes
|   `-- server.js
|-- frontend/        React single-page app
|   `-- src/         pages, components, context, api, styles, utils
|-- docs/            technical document, test plan, contribution matrix,
|                    demo script and screenshot checklist
`-- README.md
```

## Setup

### 1. Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # edit DB credentials + JWT_SECRET
npm install
npm run seed              # writes working login password hashes
npm run dev               # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api to :5000)
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@batloung.co.ls | admin123 |
| Sales | sales@batloung.co.ls | sales123 |

## Role Permissions (RBAC)

| Capability | Administrator | Sales |
|---|:---:|:---:|
| Manage fruits | Yes | No |
| Manage box sizes | Yes | No |
| Manage products | Yes | No |
| View products | Yes | Yes |
| Manage suppliers | Yes | No |
| Manage stock (record purchases) | Yes | No |
| View reports | Yes | No |
| Register / view / edit vendors | Yes | Yes |
| Delete vendors | Yes | No |
| Create orders / update order status | Yes | Yes |
| Delete orders | Yes | No |

The frontend hides restricted pages, and the backend independently enforces the same rules with JWT role checks.

## Business Rules Enforced

- Only the five required fruits are supported: Apples, Bananas, Oranges, Mangoes and Grapes.
- Only three box sizes are supported: Small, Medium and Large.
- Every product is a unique Fruit + Box Size combination with its own price and stock.
- Only registered, active street vendors can place orders.
- An order must contain at least one item; quantities must be whole numbers greater than zero.
- The same product cannot appear twice in one order.
- A vendor cannot order more boxes than are available in stock.
- Order totals are calculated on the server from stored product prices.
- Completing an order reduces available stock; cancelling never does.
- Reopening a completed order restores stock.
- Completed orders cannot be deleted.
- Vendors with existing orders cannot be deleted.
- Box sizes used by products cannot be deleted.
- Recorded purchases increase product stock.

## Features

- Login with JWT authentication and two roles
- Dashboard with summary cards, sales charts and recent orders
- Fruit management with search, active status and card/table views
- Box size management with product counts and protected deletes
- Product management with fruit, box size, price and stock
- Supplier management with search and province filtering
- Stock management with low-stock alerts and purchase history
- Street vendor management with registration, editing and status
- Google Maps links and map previews for vendor locations and supplier addresses (no API key required)
- Order creation, line items, server-calculated totals and six statuses
- Reports for sales by fruit, box size, vendor, date, province purchases and available stock
- Client-side and server-side validation
- Responsive layout for desktop, tablet and mobile

## REST API (Summary)

```
POST   /api/auth/login
GET    /api/auth/me
GET    /api/fruits         POST /api/fruits         PUT/DELETE /api/fruits/:id
GET    /api/boxsizes       POST /api/boxsizes       PUT/DELETE /api/boxsizes/:id
GET    /api/products       POST /api/products       PUT/DELETE /api/products/:id
GET    /api/suppliers      POST /api/suppliers      PUT/DELETE /api/suppliers/:id
GET    /api/vendors        POST /api/vendors        PUT/DELETE /api/vendors/:id
GET    /api/stock          POST /api/stock          PUT /api/stock/:productId
GET    /api/stock/purchases
GET    /api/orders         POST /api/orders         PUT /api/orders/:id/status
                                                    PUT /api/orders/:id
                                                    DELETE /api/orders/:id
GET    /api/reports/{dashboard|sales-by-fruit|sales-by-box|sales-by-vendor|purchases-by-province|available-stock|sales-by-date}
```

Full request and response examples are in [docs/TECHNICAL_DOCUMENT.md](docs/TECHNICAL_DOCUMENT.md).

## Testing

Run the live API integration test while the backend and MySQL are running:

```bash
cd backend
npm run test:api
```

Build the frontend:

```bash
cd frontend
npm run build
```

The latest automated run passed 55 of 55 checks. Full test cases and results are in [docs/TEST_PLAN.md](docs/TEST_PLAN.md).

## Documentation

| Document | Purpose |
|---|---|
| [docs/TECHNICAL_DOCUMENT.md](docs/TECHNICAL_DOCUMENT.md) | Architecture, data dictionary, API reference, validation, security |
| [docs/TEST_PLAN.md](docs/TEST_PLAN.md) | Automated and manual test cases with latest results |
| [docs/CONTRIBUTION_MATRIX.md](docs/CONTRIBUTION_MATRIX.md) | Group member roles and contribution template |
| [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) | Seven-minute presentation walkthrough |
| [docs/screenshots/README.md](docs/screenshots/README.md) | Required screenshot checklist |
| [database/ERD.md](database/ERD.md) | Entity relationship diagram |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting guide for the frontend, backend and database |
| [DEPLOYMENT_NOTES.md](DEPLOYMENT_NOTES.md) | Current deployment status, GitHub access fix and go-live checklist |

## Fruit Catalogue

Only the five fruits required by the brief are seeded: **Apples, Bananas, Oranges, Mangoes and Grapes**. Each fruit is sold in Small, Medium and Large boxes (15 products in total).

## Deployment

The project is ready to host:

- **Frontend:** Vercel (`frontend/vercel.json`)
- **Backend:** Render (`render.yaml`)
- **Database:** Railway MySQL

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full step-by-step guide and environment variables.

