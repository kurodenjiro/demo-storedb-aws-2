import assert from 'node:assert/strict';
import test from 'node:test';
import { createHandler } from '../src/handler.mjs';
import { parseProduct } from '../src/store.mjs';

const event = (method, path, body) => ({
  rawPath: path,
  requestContext: { http: { method } },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const responseBody = (response) => JSON.parse(response.body);

test('parseProduct normalizes a valid product', () => {
  assert.deepEqual(parseProduct({ name: '  Keyboard  ', price: 12900, inventory: 12 }), { name: 'Keyboard', price: 12900, inventory: 12 });
});

test('parseProduct rejects invalid money and inventory values', () => {
  assert.throws(() => parseProduct({ name: 'Keyboard', price: 12.5 }), /price/);
  assert.throws(() => parseProduct({ name: 'Keyboard', price: 1200, inventory: -1 }), /inventory/);
});

test('handler exposes health and product CRUD routes', async () => {
  const products = new Map();
  const store = {
    list: async () => [...products.values()],
    get: async (id) => products.get(id) ?? null,
    create: async (input) => { const product = { id: 'product-1', ...parseProduct(input) }; products.set(product.id, product); return product; },
    remove: async (id) => { const product = products.get(id) ?? null; products.delete(id); return product; },
  };
  const handler = createHandler(store);

  assert.equal((await handler(event('GET', '/health'))).statusCode, 200);
  const created = await handler(event('POST', '/products', { name: 'Keyboard', price: 12900, inventory: 12 }));
  assert.equal(created.statusCode, 201);
  assert.equal(responseBody(created).product.id, 'product-1');
  assert.equal(responseBody(await handler(event('GET', '/products'))).products.length, 1);
  assert.equal((await handler(event('GET', '/products/product-1'))).statusCode, 200);
  assert.equal((await handler(event('DELETE', '/products/product-1'))).statusCode, 200);
  assert.equal((await handler(event('GET', '/products/product-1'))).statusCode, 404);
});

test('handler returns a useful validation response instead of throwing', async () => {
  const handler = createHandler({ create: async (input) => parseProduct(input) });
  const response = await handler(event('POST', '/products', { name: '', price: 'free' }));
  assert.equal(response.statusCode, 400);
  assert.equal(responseBody(response).error, 'INVALID_PRODUCT');
});
