/*
 * Live API integration test for the Batloung Fruits backend.
 *
 * Requirements:
 *   - MySQL database imported from database/schema.sql and database/seed.sql
 *   - Backend running (npm start)
 *   - Demo users seeded (npm run seed)
 *
 * Run from the backend folder:
 *   npm run test:api
 *
 * The test creates temporary records and removes them again in a finally block.
 */

const BASE = process.env.API_URL || 'http://127.0.0.1:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@batloung.co.ls';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@batloung.co.ls';
const SALES_PASSWORD = process.env.SALES_PASSWORD || 'sales123';

const results = [];
const created = { supplier: null, fruit: null, product: null, vendor: null, orders: [], box: null };

function check(name, condition, extra = '') {
  results.push({ name, ok: !!condition });
  console.log((condition ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  [' + extra + ']' : ''));
}

async function req(method, path, token, body) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  const response = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await response.json(); } catch {}
  return { status: response.status, data };
}

async function cleanup(admin) {
  if (!admin) return;
  for (const id of created.orders) {
    const deleted = await req('DELETE', '/orders/' + id, admin).catch(() => null);
    if (!deleted || deleted.status !== 200) {
      await req('PUT', '/orders/' + id + '/status', admin, { status: 'Cancelled' }).catch(() => {});
      await req('DELETE', '/orders/' + id, admin).catch(() => {});
    }
  }
  if (created.vendor) await req('DELETE', '/vendors/' + created.vendor, admin).catch(() => {});
  if (created.product) await req('DELETE', '/products/' + created.product, admin).catch(() => {});
  if (created.fruit) await req('DELETE', '/fruits/' + created.fruit, admin).catch(() => {});
  if (created.supplier) await req('DELETE', '/suppliers/' + created.supplier, admin).catch(() => {});
  if (created.box) {
    await req('PUT', '/boxsizes/' + created.box.id, admin, {
      name: created.box.name,
      description: created.box.description,
    }).catch(() => {});
  }
}

(async () => {
  let admin = null;

  try {
    const adminLogin = await req('POST', '/auth/login', null, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    admin = adminLogin.data?.token;
    const salesLogin = await req('POST', '/auth/login', null, { email: SALES_EMAIL, password: SALES_PASSWORD });
    const sales = salesLogin.data?.token;

    check('Administrator login', !!admin);
    check('Sales login', !!sales);
    check('Invalid login rejected', (await req('POST', '/auth/login', null, { email: ADMIN_EMAIL, password: 'wrong-password' })).status === 401);

    for (const path of ['/fruits', '/suppliers', '/vendors', '/products', '/stock', '/stock/purchases', '/orders', '/boxsizes']) {
      const response = await req('GET', path, admin);
      check('GET ' + path, response.status === 200 && Array.isArray(response.data));
    }
    for (const path of ['/reports/dashboard', '/reports/sales-by-fruit', '/reports/sales-by-box', '/reports/sales-by-vendor', '/reports/purchases-by-province', '/reports/available-stock', '/reports/sales-by-date']) {
      const response = await req('GET', path, admin);
      check('GET ' + path, response.status === 200);
    }

    check('Unauthenticated request rejected', (await req('GET', '/orders')).status === 401);
    check('Sales blocked from suppliers', (await req('GET', '/suppliers', sales)).status === 403);
    check('Sales blocked from fruits', (await req('GET', '/fruits', sales)).status === 403);
    check('Sales blocked from stock', (await req('GET', '/stock', sales)).status === 403);
    check('Sales blocked from detailed reports', (await req('GET', '/reports/sales-by-vendor', sales)).status === 403);
    check('Sales blocked from creating supplier', (await req('POST', '/suppliers', sales, { name: 'x', province: 'Gauteng' })).status === 403);

    const supplier = await req('POST', '/suppliers', admin, {
      name: 'TEST Supplier',
      province: 'Gauteng',
      contact_person: 'Tester',
      telephone: '0110000000',
      email: 'test@example.com',
      address: 'Test address',
    });
    created.supplier = supplier.data?.id;
    check('Create supplier', supplier.status === 201 && !!created.supplier);
    check('Update supplier', (await req('PUT', '/suppliers/' + created.supplier, admin, { name: 'TEST Supplier 2', province: 'Limpopo' })).status === 200);
    const supplierFilter = await req('GET', '/suppliers?province=Limpopo&search=TEST', admin);
    check('Supplier province filter and search', supplierFilter.status === 200 && supplierFilter.data.some(s => s.id === created.supplier));
    check('Invalid supplier email rejected', (await req('POST', '/suppliers', admin, { name: 'Bad', province: 'Gauteng', email: 'nope' })).status === 400);

    const boxes = await req('GET', '/boxsizes', admin);
    const box = boxes.data[0];
    if (box) {
      created.box = { id: box.id, name: box.name, description: box.description };
      check('Box size list includes product counts', typeof box.product_count === 'number');
      check('Box size update works', (await req('PUT', '/boxsizes/' + box.id, admin, { name: box.name, description: 'TEST box description' })).status === 200);
      check('Used box size cannot be deleted', (await req('DELETE', '/boxsizes/' + box.id, admin)).status === 409);
    } else {
      check('Box sizes are seeded', false);
    }

    const fruit = await req('POST', '/fruits', admin, { name: 'TEST Fruit', description: 'test' });
    created.fruit = fruit.data?.id;
    check('Create fruit', fruit.status === 201 && !!created.fruit);

    const product = await req('POST', '/products', admin, {
      fruit_id: created.fruit,
      box_size_id: box?.id,
      selling_price: 10,
      stock_quantity: 5,
    });
    created.product = product.data?.id;
    check('Create product', product.status === 201 && !!created.product);
    check('Zero price rejected', (await req('POST', '/products', admin, { fruit_id: created.fruit, box_size_id: box?.id, selling_price: 0 })).status === 400);

    const vendor = await req('POST', '/vendors', admin, {
      name: 'TEST Vendor',
      business_name: 'Test Stall',
      telephone: '12345678',
      location: 'Maseru CBD',
    });
    created.vendor = vendor.data?.id;
    check('Create vendor', vendor.status === 201 && !!created.vendor);

    const order = await req('POST', '/orders', sales, {
      vendor_id: created.vendor,
      order_date: new Date().toISOString().slice(0, 10),
      items: [{ product_id: created.product, quantity: 2 }],
    });
    const orderId = order.data?.id;
    if (orderId) created.orders.push(orderId);
    check('Create order as Sales', order.status === 201 && order.data.total_amount === 20, JSON.stringify(order.data));
    check('Vendor with orders cannot be deleted', (await req('DELETE', '/vendors/' + created.vendor, admin)).status === 409);
    check('Over-stock order rejected', (await req('POST', '/orders', sales, { vendor_id: created.vendor, items: [{ product_id: created.product, quantity: 99 }] })).status === 400);
    check('Empty order rejected', (await req('POST', '/orders', sales, { vendor_id: created.vendor, items: [] })).status === 400);
    check('Duplicate product line rejected', (await req('POST', '/orders', sales, { vendor_id: created.vendor, items: [{ product_id: created.product, quantity: 1 }, { product_id: created.product, quantity: 1 }] })).status === 400);
    check('Non-integer quantity rejected', (await req('POST', '/orders', sales, { vendor_id: created.vendor, items: [{ product_id: created.product, quantity: 1.5 }] })).status === 400);
    check('Unknown vendor rejected', (await req('POST', '/orders', sales, { vendor_id: 999999, items: [{ product_id: created.product, quantity: 1 }] })).status === 400);

    const before = (await req('GET', '/products/' + created.product, admin)).data.stock_quantity;
    check('Complete order', (await req('PUT', '/orders/' + orderId + '/status', sales, { status: 'Completed' })).status === 200);
    const after = (await req('GET', '/products/' + created.product, admin)).data.stock_quantity;
    check('Stock reduced on completion', after === before - 2, before + ' -> ' + after);
    check('Completed order cannot be deleted', (await req('DELETE', '/orders/' + orderId, admin)).status === 409);
    check('Reopen order via PUT /orders/:id', (await req('PUT', '/orders/' + orderId, admin, { status: 'Processing' })).status === 200);
    const restored = (await req('GET', '/products/' + created.product, admin)).data.stock_quantity;
    check('Stock restored on reopen', restored === before, String(restored));
    check('Cancel order', (await req('PUT', '/orders/' + orderId + '/status', sales, { status: 'Cancelled' })).status === 200);
    const afterCancel = (await req('GET', '/products/' + created.product, admin)).data.stock_quantity;
    check('Cancelled order does not reduce stock', afterCancel === restored, String(afterCancel));
    check('Sales cannot delete order', (await req('DELETE', '/orders/' + orderId, sales)).status === 403);
    check('Admin deletes cancelled order', (await req('DELETE', '/orders/' + orderId, admin)).status === 200);
    created.orders = created.orders.filter(id => id !== orderId);

    const stock = await req('POST', '/stock', admin, {
      supplier_id: created.supplier,
      product_id: created.product,
      quantity: 3,
      unit_cost: 2,
    });
    check('Record incoming stock', stock.status === 201);
    const stockAfter = (await req('GET', '/products/' + created.product, admin)).data.stock_quantity;
    check('Incoming stock increases product stock', stockAfter === restored + 3, String(stockAfter));
    check('Negative stock purchase rejected', (await req('POST', '/stock', admin, { supplier_id: created.supplier, product_id: created.product, quantity: -3 })).status === 400);
    check('Vendor can be deleted when it has no orders', (await req('DELETE', '/vendors/' + created.vendor, admin)).status === 200);
    created.vendor = null;
  } catch (error) {
    console.error('TEST ERROR', error);
    results.push({ name: 'Test execution completed without exception', ok: false });
  } finally {
    await cleanup(admin);
  }

  const failed = results.filter(result => !result.ok);
  console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
  if (failed.length) {
    console.log('Failed: ' + failed.map(result => result.name).join(', '));
    process.exit(1);
  }
})();
