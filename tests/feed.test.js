const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/users");

describe("Feed API Endpoints", () => {
  let mainUserCookie;
  let mainUser;
  let userB;

  beforeEach(async () => {
    // Register Main User
    await request(app).post("/signup").send({
      firstName: "Main",
      lastName: "User",
      email: "main@example.com",
      password: "Password@123",
      age: 25,
      photoUrl: "https://example.com/main.jpg",
    });
    const loginRes = await request(app).post("/login").send({
      email: "main@example.com",
      password: "Password@123",
    });
    mainUserCookie = loginRes.headers["set-cookie"];
    mainUser = await User.findOne({ email: "main@example.com" });

    // Register User B
    await request(app).post("/signup").send({
      firstName: "UserB",
      lastName: "Beta",
      email: "b@example.com",
      password: "Password@123",
      age: 26,
      photoUrl: "https://example.com/b.jpg",
    });
    userB = await User.findOne({ email: "b@example.com" });

    // Register User C
    await request(app).post("/signup").send({
      firstName: "UserC",
      lastName: "Charlie",
      email: "c@example.com",
      password: "Password@123",
      age: 27,
      photoUrl: "https://example.com/c.jpg",
    });

    // Register User D
    await request(app).post("/signup").send({
      firstName: "UserD",
      lastName: "Delta",
      email: "d@example.com",
      password: "Password@123",
      age: 28,
      photoUrl: "https://example.com/d.jpg",
    });
  });

  describe("GET /feed", () => {
    it("should return users in the feed excluding the logged-in user", async () => {
      const res = await request(app)
        .get("/feed")
        .set("Cookie", mainUserCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("get all feed data");
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(3);

      const userIds = res.body.users.map((u) => u._id.toString());
      expect(userIds).not.toContain(mainUser._id.toString());
    });

    it("should filter out users who already have connection requests with the logged-in user", async () => {
      // Main user sends connection request to User B
      await request(app)
        .post(`/request/send/interested/${userB._id}`)
        .set("Cookie", mainUserCookie);

      const res = await request(app)
        .get("/feed")
        .set("Cookie", mainUserCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.users.length).toBe(2);

      const userIds = res.body.users.map((u) => u._id.toString());
      expect(userIds).not.toContain(userB._id.toString());
    });

    it("should support pagination parameters (limit and page)", async () => {
      const resPage1 = await request(app)
        .get("/feed?page=1&limit=2")
        .set("Cookie", mainUserCookie);

      expect(resPage1.statusCode).toBe(200);
      expect(resPage1.body.users.length).toBe(2);

      const resPage2 = await request(app)
        .get("/feed?page=2&limit=2")
        .set("Cookie", mainUserCookie);

      expect(resPage2.statusCode).toBe(200);
      expect(resPage2.body.users.length).toBe(1);
    });

    it("should return 401 if user is not authenticated", async () => {
      const res = await request(app).get("/feed");
      expect(res.statusCode).toBe(401);
    });
  });
});
