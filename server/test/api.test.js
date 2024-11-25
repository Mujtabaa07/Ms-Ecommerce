import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI_TEST);
  await User.deleteMany({});
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  let token;

  test('Register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'seller'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    token = res.body.data.token;
  });

  test('Login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  test('Create product', async () => {
    const imagePath = path.join(__dirname, 'test-image.jpg');
    
    // Create a test image if it doesn't exist
    if (!fs.existsSync(imagePath)) {
      fs.writeFileSync(imagePath, 'dummy image content');
    }

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test Product')
      .field('description', 'Test Description')
      .field('price', '99.99')
      .field('category', 'Electronics')
      .field('stock', '10')
      .attach('image', imagePath);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('_id');
  });
});