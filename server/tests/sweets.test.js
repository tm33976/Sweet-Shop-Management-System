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

  await Sweet.deleteMany({});
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Sweets API', () => {
  let token;

  //Create Admin User & Token
  beforeEach(async () => {
    //Ensure no user exists before creating one to prevent duplicate key errors
    await User.deleteMany({}); 

    const user = await User.create({
      username: 'admin',
      email: 'admin@shop.com',
      password: 'password123',
      isAdmin: true
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@shop.com', password: 'password123' });
    
    token = res.body.token;
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet when authenticated', async () => {
      const res = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lava Cake', category: 'Cake', price: 5.99, quantity: 10 });

      expect(res.statusCode).toEqual(201);
      expect(res.body.name).toEqual('Lava Cake');
    });
  });

  describe('GET /api/sweets', () => {
    it('should return a list of sweets', async () => {
      await Sweet.create({ name: 'Candy', category: 'Sugar', price: 1, quantity: 10 });
      const res = await request(app).get('/api/sweets');
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
    });
  });

  describe('PUT /api/sweets/:id', () => {
    it('should update a sweet', async () => {
      const sweet = await Sweet.create({ name: 'Old Name', category: 'Candy', price: 1, quantity: 10 });
      
      const res = await request(app)
        .put(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name', price: 2.50 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('New Name');
      expect(res.body.price).toEqual(2.50);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete a sweet', async () => {
      const sweet = await Sweet.create({ name: 'To Delete', category: 'Candy', price: 1, quantity: 10 });

      const res = await request(app)
        .delete(`/api/sweets/${sweet._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      
      // Verify it's gone
      const found = await Sweet.findById(sweet._id);
      expect(found).toBeNull();
    });
  });

  describe('Inventory Operations', () => {
    it('should decrease quantity on purchase', async () => {
      const sweet = await Sweet.create({ name: 'BuyMe', category: 'Candy', price: 1, quantity: 10 });

      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${token}`); 

      expect(res.statusCode).toEqual(200);
      expect(res.body.quantity).toEqual(9); 
    });

    it('should not allow purchase if out of stock', async () => {
      const sweet = await Sweet.create({ name: 'Empty', category: 'Candy', price: 1, quantity: 0 });

      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/purchase`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400); 
      expect(res.body.message).toMatch(/out of stock/i);
    });

    it('should increase quantity on restock', async () => {
      const sweet = await Sweet.create({ name: 'RestockMe', category: 'Candy', price: 1, quantity: 5 });

      const res = await request(app)
        .post(`/api/sweets/${sweet._id}/restock`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 10 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.quantity).toEqual(15);
    });
  });

  describe('GET /api/sweets/search', () => {
    it('should search sweets by name', async () => {
      await Sweet.create([
        { name: 'Apple Pie', category: 'Bakery', price: 5, quantity: 5 },
        { name: 'Banana Bread', category: 'Bakery', price: 4, quantity: 5 },
        { name: 'Chocolate Chip', category: 'Cookie', price: 2, quantity: 10 }
      ]);

      const res = await request(app).get('/api/sweets/search?query=Apple');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual('Apple Pie');
    });
  });

});