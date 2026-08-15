import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createStore, StoreValidationError } from './store.mjs';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
});

function bodyOf(event) {
  if (!event.body) return {};
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try { return JSON.parse(raw); } catch { throw new StoreValidationError('Body must be valid JSON.'); }
}

export function createHandler(store) {
  return async (event = {}) => {
    const method = event.requestContext?.http?.method ?? event.httpMethod ?? 'GET';
    const path = event.rawPath ?? event.path ?? '/';
    const productMatch = path.match(/^\/products\/([^/]+)$/);
    try {
      if (method === 'GET' && (path === '/' || path === '/health')) {
        return json(200, { ok: true, service: 'storedb-aws', region: process.env.AWS_REGION ?? 'local' });
      }
      if (method === 'GET' && path === '/products') return json(200, { products: await store.list() });
      if (method === 'POST' && path === '/products') return json(201, { product: await store.create(bodyOf(event)) });
      if (method === 'GET' && productMatch) {
        const product = await store.get(decodeURIComponent(productMatch[1]));
        return product ? json(200, { product }) : json(404, { error: 'PRODUCT_NOT_FOUND' });
      }
      if (method === 'DELETE' && productMatch) {
        const product = await store.remove(decodeURIComponent(productMatch[1]));
        return product ? json(200, { deleted: product }) : json(404, { error: 'PRODUCT_NOT_FOUND' });
      }
      return json(404, { error: 'ROUTE_NOT_FOUND', method, path });
    } catch (error) {
      if (error instanceof StoreValidationError) return json(400, { error: 'INVALID_PRODUCT', detail: error.message });
      console.error('StoreDB request failed', error);
      return json(500, { error: 'INTERNAL_ERROR' });
    }
  };
}

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), { marshallOptions: { removeUndefinedValues: true } });
export const handler = createHandler(createStore(client, process.env.PRODUCTS_TABLE ?? 'storedb-local'));
