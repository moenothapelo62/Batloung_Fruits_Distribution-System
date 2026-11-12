-- =====================================================================
--  Batloung Fruits - Seed data (prices in Maloti, M)
--  Run: USE batloung_fruits; then paste this entire file.
--  Only the five required fruits are seeded:
--  Apples, Bananas, Oranges, Mangoes and Grapes.
-- =====================================================================
USE batloung_fruits;

-- =====================================================================
-- Users (Run `npm run seed` in backend for REAL working password hashes)
-- =====================================================================
INSERT INTO users (full_name, email, password_hash, role) VALUES
 ('System Administrator', 'admin@batloung.co.ls',
  '$2a$10$7Qd0zq3Xr9mKQJ1Yx9m0u6kqkqkqkqkqkqkqkqkqkqkqkqkqkqkq', 'Administrator'),
 ('Sales Clerk', 'sales@batloung.co.ls',
  '$2a$10$7Qd0zq3Xr9mKQJ1Yx9m0u6kqkqkqkqkqkqkqkqkqkqkqkqkqkqkq', 'Sales');
-- (Run `npm run seed` in the backend to write REAL working hashes.)

-- =====================================================================
-- Box sizes
-- =====================================================================
INSERT INTO box_sizes (name, description) VALUES
 ('Small',  'Small quantity for street vendors with limited capital or lower daily demand.'),
 ('Medium', 'Medium quantity for street vendors with moderate customer demand.'),
 ('Large',  'Larger quantity for street vendors who purchase higher volumes.');

-- =====================================================================
-- Fruits - only the five specified fruits
-- =====================================================================
INSERT INTO fruits (name, description, is_active) VALUES
 ('Apples',  'Crisp, sweet apples sourced from Western Cape, Free State and Mpumalanga.', 1),
 ('Bananas', 'Sweet, ripe bananas from Limpopo, KwaZulu-Natal and Mpumalanga.',           1),
 ('Oranges', 'Juicy, vitamin-C-rich oranges from Limpopo, Mpumalanga and Eastern Cape.', 1),
 ('Mangoes', 'Premium ripe mangoes from Limpopo, Mpumalanga and KwaZulu-Natal.',          1),
 ('Grapes',  'Fresh, seedless grapes from Western Cape, Northern Cape and Limpopo.',     1);

-- =====================================================================
-- Suppliers across South African provinces
-- =====================================================================
INSERT INTO suppliers (name, province, contact_person, telephone, email, address) VALUES
 ('Cape Orchard Co.',      'Western Cape',  'Thabo Mokoena',   '+27 21 555 0101', 'sales@capeorchard.co.za',    '12 Vineyard Rd, Stellenbosch'),
 ('Freestate Farms',       'Free State',    'Lerato Dlamini',  '+27 51 555 0202', 'info@fsfarms.co.za',          '45 Maize Ave, Bloemfontein'),
 ('Limpopo Tropical',      'Limpopo',       'Sipho Nkosi',     '+27 15 555 0303', 'orders@limpopotrop.co.za',    '7 Baobab St, Polokwane'),
 ('KZN Banana Growers',    'KwaZulu-Natal', 'Nomsa Zulu',      '+27 31 555 0404', 'hello@kznbananas.co.za',      '88 Coastal Dr, Durban'),
 ('Mpumalanga Fresh',      'Mpumalanga',    'Jacob Pretorius', '+27 13 555 0505', 'supply@mpfresh.co.za',        '3 Lowveld Rd, Nelspruit'),
 ('Northern Cape Vines',   'Northern Cape', 'Anele Botha',     '+27 54 555 0606', 'vines@ncvines.co.za',         '21 River Rd, Upington'),
 ('Eastern Cape Citrus',   'Eastern Cape',  'Zama Khumalo',    '+27 41 555 0707', 'citrus@eccitrus.co.za',       '9 Settlers Way, Gqeberha'),
 ('North West Harvest',    'North West',    'Refilwe Motaung', '+27 18 555 0808', 'harvest@nwharvest.co.za',     '34 Marico St, Rustenburg'),
 ('Gauteng Distribution',  'Gauteng',       'Precious Sithole','+27 11 555 0909', 'dist@gautengfresh.co.za',     '56 Joburg Market, Johannesburg');

-- =====================================================================
-- Products - 5 fruits x 3 box sizes = 15 saleable configurations
-- =====================================================================
-- Apples (1-3)
INSERT INTO products (fruit_id, box_size_id, selling_price, stock_quantity, is_active) VALUES
 ((SELECT id FROM fruits WHERE name='Apples'),  (SELECT id FROM box_sizes WHERE name='Small'),    45.00, 120, 1),
 ((SELECT id FROM fruits WHERE name='Apples'),  (SELECT id FROM box_sizes WHERE name='Medium'),   80.00,  90, 1),
 ((SELECT id FROM fruits WHERE name='Apples'),  (SELECT id FROM box_sizes WHERE name='Large'),   140.00,  60, 1),
-- Bananas (4-6)
 ((SELECT id FROM fruits WHERE name='Bananas'), (SELECT id FROM box_sizes WHERE name='Small'),    38.00, 150, 1),
 ((SELECT id FROM fruits WHERE name='Bananas'), (SELECT id FROM box_sizes WHERE name='Medium'),   70.00, 110, 1),
 ((SELECT id FROM fruits WHERE name='Bananas'), (SELECT id FROM box_sizes WHERE name='Large'),   120.00,  55, 1),
-- Oranges (7-9)
 ((SELECT id FROM fruits WHERE name='Oranges'), (SELECT id FROM box_sizes WHERE name='Small'),    42.00, 110, 1),
 ((SELECT id FROM fruits WHERE name='Oranges'), (SELECT id FROM box_sizes WHERE name='Medium'),   75.00,  85, 1),
 ((SELECT id FROM fruits WHERE name='Oranges'), (SELECT id FROM box_sizes WHERE name='Large'),   130.00,  50, 1),
-- Mangoes (10-12)
 ((SELECT id FROM fruits WHERE name='Mangoes'), (SELECT id FROM box_sizes WHERE name='Small'),    55.00,  80, 1),
 ((SELECT id FROM fruits WHERE name='Mangoes'), (SELECT id FROM box_sizes WHERE name='Medium'),   95.00,  60, 1),
 ((SELECT id FROM fruits WHERE name='Mangoes'), (SELECT id FROM box_sizes WHERE name='Large'),   160.00,  35, 1),
-- Grapes (13-15)
 ((SELECT id FROM fruits WHERE name='Grapes'),  (SELECT id FROM box_sizes WHERE name='Small'),    60.00,  70, 1),
 ((SELECT id FROM fruits WHERE name='Grapes'),  (SELECT id FROM box_sizes WHERE name='Medium'),  105.00,  45, 1),
 ((SELECT id FROM fruits WHERE name='Grapes'),  (SELECT id FROM box_sizes WHERE name='Large'),   180.00,  25, 1);

-- =====================================================================
-- Street vendors - 10 vendors in Maseru
-- =====================================================================
INSERT INTO street_vendors (name, business_name, telephone, location, registration_date, status) VALUES
 ('Palesa Mohapi',    'Palesa Fresh Stall',      '+266 5800 1111', 'Maseru CBD',     '2026-01-15', 'Active'),
 ('Teboho Letsie',    'Teboho Fruit Corner',     '+266 5800 2222', 'Khubetsoana',    '2026-02-03', 'Active'),
 ('Mamello Ranthako', 'Mamello Market',          '+266 5800 3333', 'Thetsane',       '2026-02-20', 'Active'),
 ('Katleho Sello',    'Katleho Vendors',         '+266 5800 4444', 'Maseru West',    '2026-03-10', 'Active'),
 ('Lineo Mphutlane',  'Lineo Daily Fruits',      '+266 5800 5555', 'Ha Thetsane',    '2026-03-25', 'Active'),
 ('Mpho Sekhonyana',  'Mpho Fresh Corner',       '+266 5800 6666', 'Thamae',         '2026-04-08', 'Active'),
 ('Nthabiseng Mosia', "Nthabiseng's Stall",      '+266 5800 7777', 'Hoohlo',         '2026-04-22', 'Active'),
 ('Rethabile Phoofolo','Rethabile Market',       '+266 5800 8888', 'Maseru CBD',     '2026-05-05', 'Active'),
 ('Selloane Nkosi',   'Selloane Fruit Express',  '+266 5800 9999', 'Lepereng',       '2026-05-18', 'Active'),
 ('Tsepiso Ramokoena','Tsepiso Village Stall',   '+266 5801 0001', 'Ha Thetsane',    '2026-06-01', 'Inactive');

-- =====================================================================
-- Purchases (incoming stock from suppliers) - only products 1-15
-- =====================================================================
INSERT INTO purchases (supplier_id, product_id, quantity, unit_cost, purchase_date) VALUES
 (1, 1,  50, 28.00, '2026-09-01'),
 (3, 4,  60, 22.00, '2026-09-02'),
 (7, 7,  45, 26.00, '2026-09-05'),
 (3, 10, 35, 36.00, '2026-09-08'),
 (6, 13, 25, 40.00, '2026-09-10'),
 (4, 5,  40, 45.00, '2026-09-12'),
 (5, 2,  30, 52.00, '2026-09-15'),
 (3, 14, 20, 70.00, '2026-09-18'),
 (5, 8,  25, 50.00, '2026-09-20'),
 (3, 11, 30, 62.00, '2026-09-22'),
 (1, 3,  40, 90.00, '2026-10-01'),
 (4, 6,  35, 76.00, '2026-10-03'),
 (3, 12, 20, 105.00,'2026-10-05'),
 (6, 15, 15, 120.00,'2026-10-07'),
 (4, 5,  50, 49.00, '2026-10-08'),
 (7, 9,  25, 85.00, '2026-10-10'),
 (2, 2,  30, 62.00, '2026-10-12'),
 (5, 1,  20, 57.00, '2026-10-14');

-- =====================================================================
-- Orders - all six statuses represented
-- =====================================================================
INSERT INTO orders (vendor_id, order_date, total_amount, status) VALUES
 (1, '2026-09-10', 0, 'Completed'),
 (2, '2026-09-12', 0, 'Completed'),
 (3, '2026-09-14', 0, 'Completed'),
 (4, '2026-09-16', 0, 'Completed'),
 (5, '2026-09-18', 0, 'Completed'),
 (1, '2026-09-20', 0, 'Completed'),
 (6, '2026-09-22', 0, 'Completed'),
 (7, '2026-09-24', 0, 'Completed'),
 (2, '2026-09-26', 0, 'Completed'),
 (8, '2026-09-28', 0, 'Completed'),
 (1, '2026-10-02', 0, 'Pending'),
 (3, '2026-10-04', 0, 'Pending'),
 (5, '2026-10-05', 0, 'Confirmed'),
 (2, '2026-10-06', 0, 'Confirmed'),
 (4, '2026-10-07', 0, 'Processing'),
 (6, '2026-10-08', 0, 'Processing'),
 (7, '2026-10-09', 0, 'Ready for Collection/Delivery'),
 (9, '2026-10-10', 0, 'Ready for Collection/Delivery'),
 (1, '2026-10-11', 0, 'Cancelled'),
 (8, '2026-10-12', 0, 'Completed');

-- =====================================================================
-- Order items - all product_id values are within 1-15
-- =====================================================================
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
 -- Order 1
 (1, 1, 4, 45.00, 180.00), (1, 5, 3, 70.00, 210.00), (1, 7, 2, 42.00, 84.00),
 -- Order 2
 (2, 4, 5, 38.00, 190.00), (2, 10, 2, 55.00, 110.00), (2, 13, 2, 60.00, 120.00),
 -- Order 3
 (3, 7, 6, 42.00, 252.00), (3, 8, 3, 75.00, 225.00), (3, 14, 2, 105.00, 210.00),
 -- Order 4
 (4, 2, 3, 80.00, 240.00), (4, 11, 2, 95.00, 190.00), (4, 9, 2, 130.00, 260.00),
 -- Order 5
 (5, 5, 4, 70.00, 280.00), (5, 14, 2, 105.00, 210.00), (5, 12, 1, 160.00, 160.00),
 -- Order 6
 (6, 1, 5, 45.00, 225.00), (6, 4, 4, 38.00, 152.00), (6, 10, 2, 55.00, 110.00),
 -- Order 7
 (7, 7, 3, 42.00, 126.00), (7, 13, 3, 60.00, 180.00), (7, 6, 2, 120.00, 240.00),
 -- Order 8
 (8, 8, 4, 75.00, 300.00), (8, 11, 2, 95.00, 190.00), (8, 15, 1, 180.00, 180.00),
 -- Order 9
 (9, 4, 6, 38.00, 228.00), (9, 5, 4, 70.00, 280.00), (9, 7, 3, 42.00, 126.00),
 -- Order 10
 (10, 1, 5, 45.00, 225.00), (10, 7, 4, 42.00, 168.00), (10, 9, 2, 130.00, 260.00),
 -- Order 11 (Pending)
 (11, 2, 3, 80.00, 240.00), (11, 5, 5, 70.00, 350.00), (11, 13, 2, 60.00, 120.00),
 -- Order 12 (Pending)
 (12, 7, 5, 42.00, 210.00), (12, 8, 3, 75.00, 225.00), (12, 14, 2, 105.00, 210.00),
 -- Order 13 (Confirmed)
 (13, 4, 6, 38.00, 228.00), (13, 10, 3, 55.00, 165.00), (13, 12, 2, 160.00, 320.00),
 -- Order 14 (Confirmed)
 (14, 11, 2, 95.00, 190.00), (14, 14, 2, 105.00, 210.00), (14, 15, 1, 180.00, 180.00),
 -- Order 15 (Processing)
 (15, 1, 4, 45.00, 180.00), (15, 7, 3, 42.00, 126.00), (15, 9, 2, 130.00, 260.00),
 -- Order 16 (Processing)
 (16, 4, 5, 38.00, 190.00), (16, 13, 2, 60.00, 120.00),
 -- Order 17 (Ready)
 (17, 10, 3, 55.00, 165.00), (17, 6, 2, 120.00, 240.00),
 -- Order 18 (Ready)
 (18, 8, 4, 75.00, 300.00), (18, 5, 3, 70.00, 210.00),
 -- Order 19 (Cancelled)
 (19, 2, 3, 80.00, 240.00), (19, 3, 1, 140.00, 140.00),
 -- Order 20 (Completed)
 (20, 1, 5, 45.00, 225.00), (20, 4, 4, 38.00, 152.00);

-- =====================================================================
-- Recalculate order totals from items
-- =====================================================================
UPDATE orders o SET total_amount = (
  SELECT COALESCE(SUM(subtotal),0) FROM order_items oi WHERE oi.order_id = o.id
);
