import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;

beforeAll(async () => {
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
  
  await mongoose.connect(process.env.MONGODB_URI_TEST);
  await User.deleteMany({});
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('E-commerce API Tests', () => {
  let customerToken;
  let sellerToken;
  let productId;

  describe('Auth Tests', () => {
    test('Register seller', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Seller',
          email: 'seller@test.com',
          password: 'password123',
          role: 'seller'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('token');
      sellerToken = res.body.data.token;
    });

    test('Register customer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'customer@test.com',
          password: 'password123',
          role: 'customer'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('token');
      customerToken = res.body.data.token;
    });
  });

  describe('Product Tests', () => {
    test('Create product', async () => {
      const imagePath = path.join(__dirname, 'test-image.jpg');
      
      // Create a test image if it doesn't exist
      if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, 'dummy image content');
      }

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', 'Test Product')
        .field('description', 'Test Description')
        .field('price', '99.99')
        .field('category', 'Electronics')
        .field('stock', '10')
        .attach('image', imagePath);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
      productId = res.body.data._id;
    });

    test('Get products', async () => {
      const res = await request(app)
        .get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('Order Tests', () => {
    test('Create order', async () => {
      // First create a product to order
      const productRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .field('name', 'Test Product')
        .field('description', 'Test Description')
        .field('price', '99.99')
        .field('category', 'Electronics')
        .field('stock', '10')
        .attach('image', path.join(__dirname, 'test-image.jpg'));

      const productId = productRes.body.data._id;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [{
            product: productId,
            quantity: 1
          }],
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            zipCode: '12345',
            country: 'Test Country'
          }
        });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id');
    });
  });
});