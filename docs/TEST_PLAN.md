# Batloung Fruits — Test Plan and Test Report

## 1. Purpose

This document describes how the Batloung Fruits Distribution Management System was tested. It covers:

- Automated API integration tests
- Manual user interface tests
- Role-based access control tests
- Business rule and stock tests
- Responsive layout checks

## 2. Test Environment

| Item | Value |
|---|---|
| Operating system | Windows |
| Backend runtime | Node.js v24 |
| Database | MySQL 8.0, database `batloung_fruits` |
| API base URL | `http://localhost:5000/api` |
| Frontend dev URL | `http://localhost:5173` |
| Browser | Chrome or Edge |
| Administrator account | admin@batloung.co.ls / admin123 |
| Sales account | sales@batloung.co.ls / sales123 |

## 3. Prerequisites

1. Import `database/schema.sql`.
2. Import `database/seed.sql`.
3. Create `backend/.env` with the database password and a `JWT_SECRET`.
4. Run `npm run seed` in `backend` to set bcrypt password hashes.
5. Start the backend with `npm start`.
6. Confirm `GET /api/health` returns `{"status":"ok","service":"Batloung Fruits API"}`.

## 4. Automated API Integration Test

Run:

```bash
cd backend
npm run test:api
```

The test uses the live API and database. It creates temporary records, verifies behaviour, and removes the records in a `finally` cleanup block. It must be run against a development database, not a production database.

Configuration can be overridden with environment variables:

```env
API_URL=http://127.0.0.1:5000/api
ADMIN_EMAIL=admin@batloung.co.ls
ADMIN_PASSWORD=admin123
SALES_EMAIL=sales@batloung.co.ls
SALES_PASSWORD=sales123
```

### 4.1 Automated Coverage

| Area | Checks |
|---|---|
| Authentication | Administrator login, Sales login, wrong password rejected, unauthenticated request rejected |
| RBAC | Sales blocked from suppliers, fruits, stock, detailed reports and supplier creation; Sales blocked from deleting orders; Admin-only deletes enforced |
| Fruits | List, create, duplicate/name validation through API responses |
| Box sizes | List with product counts, update description, used box size cannot be deleted |
| Suppliers | Create, update, search, province filter, invalid email rejected |
| Products | Create fruit and box-size product, zero price rejected |
| Vendors | Create, vendor with orders cannot be deleted, vendor with no orders can be deleted |
| Orders | Create, server-calculated total, over-stock rejected, empty order rejected, duplicate product rejected, non-integer quantity rejected, unknown vendor rejected |
| Order workflow | Complete reduces stock, completed order cannot be deleted, reopen restores stock, cancel leaves stock unchanged, Sales cannot delete, Administrator can delete |
| Stock | Incoming purchase increases stock, negative quantity rejected |
| Reports | Dashboard, sales by fruit, sales by box, sales by vendor, purchases by province, available stock, sales by date |
| Lists | Fruits, suppliers, vendors, products, stock, purchases, orders, box sizes |

### 4.2 Latest Automated Result

| Date | Checks | Passed | Failed |
|---|---|---|---|
| 12 November 2026 | 55 | 55 | 0 |

The latest run printed:

```
55/55 checks passed
```

### 4.3 Build Verification

| Command | Expected result |
|---|---|
| `cd frontend && npm run build` | Vite production build completes without errors |
| `cd backend && node --check server.js` | No syntax errors |
| `cd backend && node --check routes/orders.js` | No syntax errors |
| `cd backend && node --check routes/boxsizes.js` | No syntax errors |

## 5. Manual UI Test Cases

| ID | Area | Steps | Expected result |
|---|---|---|---|
| UI-01 | Login | Open the app while signed out | Login page is displayed and protected pages redirect to login |
| UI-02 | Login | Enter valid Administrator credentials | Dashboard loads with summary cards and charts |
| UI-03 | Login | Enter an invalid password | Error message is shown and no session is created |
| UI-04 | Login | Enter valid Sales credentials | Sales navigation shows Dashboard, Products, Vendors and Orders only |
| UI-05 | Dashboard | View the dashboard as Administrator | Cards show fruit, supplier, vendor, stock, order and sales values |
| UI-06 | Dashboard | View the dashboard as Sales | Summary cards and permitted charts load without errors |
| UI-07 | Fruits | Create a fruit with a blank name | Inline validation error is shown and no record is created |
| UI-08 | Fruits | Create a fruit with a valid name | Fruit appears in the table and card views |
| UI-09 | Fruits | Search for a fruit | Table filters to matching fruit names |
| UI-10 | Fruits | Edit a fruit name and status | Updated values appear immediately |
| UI-11 | Fruits | Delete a fruit | Confirmation appears and the fruit is removed with related products |
| UI-12 | Box Sizes | Open Box Sizes as Administrator | Small, Medium and Large are listed with product counts |
| UI-13 | Box Sizes | Edit a box-size description | Description is saved and displayed |
| UI-14 | Box Sizes | Try to delete a box size used by products | Delete button is disabled or the API returns a conflict message |
| UI-15 | Products | Create a product without a fruit or box size | Inline validation error is shown |
| UI-16 | Products | Create a product with a valid fruit, box size and price | Product appears in card and table views |
| UI-17 | Products | Enter a zero or negative selling price | Inline validation error is shown |
| UI-18 | Products | Filter by box size and status | Only matching products are shown |
| UI-19 | Products | Search by fruit name | Matching products are shown |
| UI-20 | Suppliers | Create a supplier without a name or province | Inline validation error is shown |
| UI-21 | Suppliers | Enter an invalid email | Inline validation error is shown |
| UI-22 | Suppliers | Create a valid supplier | Supplier appears in the table |
| UI-23 | Suppliers | Filter by province | Only suppliers in that province are listed |
| UI-24 | Vendors | Register a vendor without a location | Inline validation error is shown |
| UI-25 | Vendors | Register a valid vendor as Sales | Vendor is created and appears in the list |
| UI-26 | Vendors | Edit a vendor as Sales | Changes are saved |
| UI-27 | Vendors | Delete a vendor as Administrator | Confirmation appears and the vendor is removed when it has no orders |
| UI-28 | Vendors | Delete a vendor with orders | Conflict message is shown |
| UI-29 | Stock | Record incoming stock without a supplier or product | Inline validation error is shown |
| UI-30 | Stock | Enter a zero or negative quantity | Inline validation error is shown |
| UI-31 | Stock | Record a valid purchase | Purchase appears in history and product stock increases |
| UI-32 | Orders | Create an order without a vendor | Inline validation error is shown |
| UI-33 | Orders | Create an order with no product | Inline validation error is shown |
| UI-34 | Orders | Enter a quantity above available stock | Inline validation error is shown before submission |
| UI-35 | Orders | Add the same product twice | Inline validation error is shown |
| UI-36 | Orders | Create a valid order as Sales | Order appears with Pending status and correct total |
| UI-37 | Orders | Open an order and change status to Completed | Status updates and stock decreases |
| UI-38 | Orders | Move a Completed order back to Processing | Stock is restored |
| UI-39 | Orders | Cancel an order | Status becomes Cancelled and stock is unchanged |
| UI-40 | Orders | Try to delete a Completed order as Administrator | API rejects the delete with a conflict message |
| UI-41 | Orders | Delete a cancelled order as Administrator | Order is removed |
| UI-42 | Reports | Open Reports as Administrator | All report sections load with charts and tables |
| UI-43 | Reports | Filter the sales-by-date range | Displayed data matches the selected range |
| UI-44 | RBAC | Navigate to `/fruits`, `/suppliers`, `/stock` or `/reports` as Sales | User is redirected to the dashboard |
| UI-45 | Session | Sign out | Session is cleared and the login page is shown |
| UI-46 | Vendor Maps | Click the Map action or location for a vendor | Google Maps preview opens and the Open in Google Maps link works |
| UI-47 | Supplier Maps | Click the Map action for a supplier | Google Maps preview opens for the supplier address and province |

## 6. Business Rule Test Cases

| ID | Rule | Expected result | Status |
|---|---|---|---|
| BR-01 | Only five fruits are supported | Seed data contains Apples, Bananas, Oranges, Mangoes and Grapes | Passed |
| BR-02 | Three box sizes | Small, Medium and Large exist | Passed |
| BR-03 | Order requires a registered active vendor | Unknown or inactive vendor is rejected | Passed |
| BR-04 | Order requires at least one item | Empty order is rejected | Passed |
| BR-05 | No duplicate products in an order | Duplicate product line is rejected | Passed |
| BR-06 | Quantity must be a positive whole number | Decimal and zero quantities are rejected | Passed |
| BR-07 | Cannot order more than available stock | Over-stock order is rejected | Passed |
| BR-08 | Order total is calculated by the server | Client cannot submit a false total | Passed |
| BR-09 | Completing an order reduces stock | Stock decreases by ordered quantity | Passed |
| BR-10 | Reopening a completed order restores stock | Stock returns to the previous level | Passed |
| BR-11 | Cancelling an order does not reduce stock | Stock remains unchanged | Passed |
| BR-12 | Completed orders cannot be deleted | API returns 409 | Passed |
| BR-13 | Vendor with orders cannot be deleted | API returns 409 | Passed |
| BR-14 | Used box sizes cannot be deleted | API returns 409 | Passed |
| BR-15 | Purchase increases stock | Stock increases by received quantity | Passed |

## 7. Responsive Layout Checklist

Test at 1440 px, 1024 px, 768 px and 375 px widths.

| Check | Expected result |
|---|---|
| Sidebar on desktop | Fixed left sidebar with full navigation |
| Sidebar on tablet and mobile | Horizontal scrollable navigation bar |
| Dashboard cards | Stack or wrap without horizontal overflow |
| Tables | Horizontal scroll inside the table container |
| Toolbars | Search and filters wrap onto separate lines |
| Modals | Remain usable and scrollable on small screens |
| Hero banners | Content wraps and remains readable |
| Buttons | Remain tappable and do not overlap |

## 8. Security Test Cases

| ID | Test | Expected result |
|---|---|---|
| SEC-01 | Call a protected endpoint without a token | 401 Unauthorized |
| SEC-02 | Call a protected endpoint with an invalid token | 401 Unauthorized |
| SEC-03 | Sales calls an Administrator-only endpoint | 403 Forbidden |
| SEC-04 | Send an SQL injection string in a search field | Treated as plain text; no query error |
| SEC-05 | Submit a very large JSON body | Request rejected by the body size limit |
| SEC-06 | Attempt repeated failed logins | Login rate limit activates |
| SEC-07 | Inspect the database password column | Only bcrypt hashes are stored |

## 9. Defect Log Template

| Field | Description |
|---|---|
| Defect ID | |
| Date found | |
| Test case | |
| Severity | Critical / High / Medium / Low |
| Steps to reproduce | |
| Expected result | |
| Actual result | |
| Status | Open / Fixed / Retest |

## 10. Sign-Off

| Role | Name | Signature | Date |
|---|---|---|---|
| Tester | | | |
| Developer | | | |
| Project lead | | | |
