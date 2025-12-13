const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User'); 

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/sweetshop_test_db';
  await mongoose.connect(url);
});

afterEach(async () => {
  // Clear the database after every test so they don't interfere with each other
  await User.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and return a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'candyman',
        email: 'candy@shop.com',
        password: 'securepassword123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
  });

  it('should not allow duplicate emails', async () => {
    await User.create({
      username: 'existinguser',
      email: 'repeat@shop.com',
      password: 'password123'
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'repeat@shop.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

// --- NEW LOGIN TESTS START HERE ---
describe('POST /api/auth/login', () => {
  it('should login an existing user and return a token', async () => {
    // 1. Setup: Create a user in the DB manually
    await User.create({
      username: 'loginuser',
      email: 'login@shop.com',
      password: 'password123'
    });

    // 2. Action: Try to log in with correct credentials
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@shop.com',
        password: 'password123'
      });

    // 3. Assertion: Should succeed
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toEqual('login@shop.com');
  });

  it('should reject incorrect passwords', async () => {
    // 1. Setup: Create a user
    await User.create({
      username: 'wrongpass',
      email: 'wrong@shop.com',
      password: 'password123'
    });

    // 2. Action: Try to log in with WRONG password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@shop.com',
        password: 'wrongpassword' // Intentional mismatch
      });

    // 3. Assertion: Should fail
    expect(res.statusCode).toEqual(400); // 400 Bad Request or 401 Unauthorized
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});