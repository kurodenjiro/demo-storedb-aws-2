import { randomUUID } from 'node:crypto';
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

export class StoreValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StoreValidationError';
  }
}

export function parseProduct(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new StoreValidationError('Body must be a JSON object.');
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const price = Number(input.price);
  const inventory = input.inventory === undefined ? 0 : Number(input.inventory);
  if (name.length < 2 || name.length > 120) throw new StoreValidationError('name must contain 2–120 characters.');
  if (!Number.isInteger(price) || price < 0) throw new StoreValidationError('price must be a non-negative integer in cents.');
  if (!Number.isInteger(inventory) || inventory < 0) throw new StoreValidationError('inventory must be a non-negative integer.');
  return { name, price, inventory };
}

export function createStore(documentClient, tableName, now = () => new Date().toISOString(), id = randomUUID) {
  if (!tableName) throw new Error('PRODUCTS_TABLE is required.');
  return {
    async list() {
      const result = await documentClient.send(new ScanCommand({ TableName: tableName }));
      return (result.Items ?? []).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    async get(productId) {
      const result = await documentClient.send(new GetCommand({ TableName: tableName, Key: { id: productId } }));
      return result.Item ?? null;
    },
    async create(input) {
      const product = { id: id(), ...parseProduct(input), createdAt: now() };
      await documentClient.send(new PutCommand({ TableName: tableName, Item: product, ConditionExpression: 'attribute_not_exists(id)' }));
      return product;
    },
    async remove(productId) {
      const previous = await documentClient.send(new DeleteCommand({ TableName: tableName, Key: { id: productId }, ReturnValues: 'ALL_OLD' }));
      return previous.Attributes ?? null;
    },
  };
}
