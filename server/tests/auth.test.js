const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

// Robust Connection Setup
beforeAll(async () => {
  const url =
    process.env.MONGO_URI_TEST ||
    "mongodb://localhost:27017/sweetshop_test_execution";

  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(url);
  }
});

// Robust Cleanup
afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe("POST /api/auth/register", () => {
  it("should register a new user and return a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "candyman",
      email: "candy@shop.com",
      password: "securepassword123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
  });

  it("should not allow duplicate emails", async () => {
    //Create user directly in DB
    await User.create({
      username: "existinguser",
      email: "repeat@shop.com",
      password: "password123",
    });

    //  Try to register same email
    const res = await request(app).post("/api/auth/register").send({
      username: "newuser",
      email: "repeat@shop.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/already exists/i);
  });
});

describe("POST /api/auth/login", () => {
  // Clear DB before this specific block to ensure clean state
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("should login an existing user and return a token", async () => {
    //  Setup
    await User.create({
      username: "loginuser",
      email: "login@shop.com",
      password: "password123",
    });

    //Action
    const res = await request(app).post("/api/auth/login").send({
      email: "login@shop.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toEqual("login@shop.com");
  });

  it("should reject incorrect passwords", async () => {
    await User.create({
      username: "wrongpass",
      email: "wrong@shop.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrong@shop.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});
