const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/users");

describe("Auth API Endpoints", () => {
  const testUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "Password@123",
    age: 25,
    photoUrl: "https://example.com/photo.jpg",
  };

  describe("POST /signup", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post("/signup").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User registered successfully!");

      const userInDb = await User.findOne({ email: testUser.email });
      expect(userInDb).not.toBeNull();
      expect(userInDb.firstName).toBe(testUser.firstName);
    });

    it("should return 400 if any required field is missing", async () => {
      const invalidUser = { ...testUser };
      delete invalidUser.firstName;

      const res = await request(app).post("/signup").send(invalidUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("All fields required");
    });

    it("should return 400 if user with email already exists", async () => {
      await request(app).post("/signup").send(testUser);
      const res = await request(app).post("/signup").send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already exists");
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      await request(app).post("/signup").send(testUser);
    });

    it("should log in successfully with valid credentials and set cookie", async () => {
      const res = await request(app).post("/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Login successful");
      expect(res.body.token).toBeDefined();

      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith("token="))).toBe(true);
    });

    it("should return 400 with incorrect password", async () => {
      const res = await request(app).post("/login").send({
        email: testUser.email,
        password: "WrongPassword@123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 400 if user does not exist", async () => {
      const res = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "Password@123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 400 if email or password is missing or invalid", async () => {
      const res = await request(app).post("/login").send({
        email: "invalid-email",
        password: "123",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /logout", () => {
    it("should log out successfully and clear the token cookie", async () => {
      const res = await request(app).post("/logout");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
      const cookies = res.headers["set-cookie"];
      expect(cookies).toBeDefined();
    });
  });
});
