# Demo Script

This script guides a seven-minute demonstration of the Batloung Fruits Distribution Management System. Replace the group names in the introduction.

## 1. Before the Demo

1. Start MySQL.
2. Start the backend with `cd backend && npm start`.
3. Start the frontend with `cd frontend && npm run dev`.
4. Open `http://localhost:5173`.
5. Confirm both demo accounts work.
6. Have one Administrator tab and one Sales tab ready.

## 2. Introduction (30 seconds)

"Batloung Fruits is a fruit distribution business that supplies street vendors in Maseru. Our system replaces paper orders with a web application for fruit management, supplier management, stock control, vendor orders and reporting. It uses React, Express and MySQL, with JWT authentication and role-based access."

## 3. Login and Role Demonstration (45 seconds)

1. Sign in as Administrator.
2. Point out the full navigation: Dashboard, Fruits, Products, Box Sizes, Suppliers, Stock, Orders, Vendors and Reports.
3. Sign out and sign in as Sales.
4. Point out the reduced navigation: Dashboard, Products, Vendors and Orders.
5. Explain that the backend enforces the same restrictions, not just the menu.

## 4. Dashboard (30 seconds)

1. Show the summary cards: fruits, suppliers, active vendors, available stock, orders and completed sales.
2. Show the sales charts and recent orders.
3. Mention that only Completed orders count towards sales.

## 5. Fruit and Box-Size Management (60 seconds)

1. Open Fruits as Administrator.
2. Search for Mango.
3. Open the Add Fruit modal and submit an empty name to show validation.
4. Add a valid fruit.
5. Open Box Sizes.
6. Show Small, Medium and Large with product counts.
7. Edit a box-size description.
8. Explain that a box size used by products cannot be deleted.

## 6. Suppliers and Stock (60 seconds)

1. Open Suppliers.
2. Filter by a province such as Western Cape.
3. Show the supplier search.
4. Open the Map action for a supplier to show the address on Google Maps.
4. Open Stock and show available stock and low-stock alerts.
5. Record incoming stock for a product.
6. Show that the purchase appears in history and the stock quantity increases.

## 7. Vendor Management (45 seconds)

1. Open Vendors as Sales.
2. Register a new vendor.
3. Show that Sales can register and edit vendors but cannot delete them.
4. Open the Map action for a vendor to show the Google Maps preview and the Open in Google Maps link.
5. Switch to Administrator and show the delete action.
6. Explain that a vendor with orders cannot be deleted.

## 8. Order Workflow (90 seconds)

1. Open Orders as Sales.
2. Create an order with two products.
3. Show the estimated total.
4. Try to order more than available stock to show validation.
5. Create a valid order.
6. Open the order and show the status stepper.
7. Move the order to Completed.
8. Open Stock and show that stock decreased.
9. Reopen the order to Processing and show that stock was restored.
10. Cancel the order and show that stock is unchanged.

## 9. Reports (45 seconds)

1. Sign in as Administrator.
2. Open Reports.
3. Show sales by fruit, sales by vendor, purchases by province, sales by date and available stock.
4. Point out that Sales users cannot open the Reports page.

## 10. Database and Technical Highlights (30 seconds)

1. Show the ERD in `database/ERD.md`.
2. Mention the nine tables, primary keys, foreign keys and constraints.
3. Mention parameterised SQL, bcrypt password hashing, JWT authentication and login rate limiting.
4. Mention that the API integration test passes 55 checks.
5. Mention that the frontend production build completes successfully.

## 11. Closing (15 seconds)

"The system meets the functional requirements: five fruits, three box sizes, nine provinces, street vendors, six order statuses, role-based access, stock rules, reports and a relational database. Thank you. We are ready for questions."

## 12. Likely Questions and Answers

| Question | Suggested answer |
|---|---|
| Why only five fruits? | The business rule fixes the catalogue to five products, so the schema and seed data enforce that scope. |
| How is stock protected from negative values? | The products table has a check constraint, the API validates integer quantities, and completion checks stock inside a transaction. |
| What happens if two users complete orders at the same time? | Order creation and completion use database transactions and row updates, and stock is checked before completion. |
| How are passwords protected? | Passwords are hashed with bcrypt and never returned by the API. |
| How is role-based access enforced? | The frontend hides routes, and the backend independently checks the JWT role with `authorize`. |
| Why does cancelling not reduce stock? | Stock is only reduced at completion, which mirrors the business rule that cancelled orders do not consume stock. |
| How are totals calculated? | The server reads product prices from the database, multiplies by quantity and stores subtotals and the order total. |
| What would you add next? | Payment tracking, SMS notifications, multi-branch stock and an audit trail. |
