const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User'); 

beforeAll(async () => {
  const url = process.env.MONGO_URI || 'mongodb://localhost:27017/sweetshop_test_db';
  await mongoose.connect(url);
});

afterEach(async () => {
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