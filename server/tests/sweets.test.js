const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Sweet = require('../models/Sweet'); 

// Setup and Teardown
beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/sweetshop_test_db';
  await mongoose.connect(url);
});

afterEach(async () => {
  await Sweet.deleteMany();
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Sweets API', () => {
  let token;

  // Helper to create a user and get a token before running tests
  beforeEach(async () => {
    const user = await User.create({
      username: 'admin',
      email: 'admin@shop.com',
      password: 'password123',
      isAdmin: true
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@shop.com',
        password: 'password123'
      });
    
    token = res.body.token;
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet when authenticated', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`) // Send the JWT token
        .send({
          name: 'Chocolate Lava Cake',
          category: 'Cake',
          price: 5.99,
          quantity: 10
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual('Chocolate Lava Cake');
      expect(res.body.quantity).toEqual(10);
    });

    it('should reject creation without a token', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Ghost Cookie',
          category: 'Cookie',
          price: 2.00,
          quantity: 5
        });

      expect(res.statusCode).toEqual(401); // Unauthorized
    });
  });

  describe('GET /api/sweets', () => {
    it('should return a list of sweets', async () => {
      // 1. Create some sweets in the DB
      await Sweet.create([
        { name: 'Lollipop', category: 'Candy', price: 1.00, quantity: 50 },
        { name: 'Brownie', category: 'Bakery', price: 3.50, quantity: 20 }
      ]);

      // 2. Fetch them
      const res = await request(app).get('/api/sweets');

      // 3. Assertions
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(2);
    });
  });
});