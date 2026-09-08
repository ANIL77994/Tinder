const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/users");

describe("User Connections & Requests API Endpoints", () => {
  let user1Cookie;
  let user2Cookie;
  let user2;

  beforeEach(async () => {
    // User 1
    await request(app).post("/signup").send({
      firstName: "User",
      lastName: "One",
      email: "user1@example.com",
      password: "Password@123",
      age: 25,
      photoUrl: "https://example.com/u1.jpg",
    });
    const login1 = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "Password@123",
    });
    user1Cookie = login1.headers["set-cookie"];

    // User 2
    await request(app).post("/signup").send({
      firstName: "User",
      lastName: "Two",
      email: "user2@example.com",
      password: "Password@123",
      age: 27,
      photoUrl: "https://example.com/u2.jpg",
    });
    const login2 = await request(app).post("/login").send({
      email: "user2@example.com",
      password: "Password@123",
    });
    user2Cookie = login2.headers["set-cookie"];
    user2 = await User.findOne({ email: "user2@example.com" });
  });

  describe("GET /user/requests/recives", () => {
    it("should return received connection requests for logged in user", async () => {
      // User 1 sends request to User 2
      await request(app)
        .post(`/request/send/interested/${user2._id}`)
        .set("Cookie", user1Cookie);

      const res = await request(app)
        .get("/user/requests/recives")
        .set("Cookie", user2Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Successfully get the data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].firstName).toBe("User");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/user/requests/recives");
      expect(res.statusCode).toBe(401);
    });
  });

  describe("GET /user/connections", () => {
    it("should return empty message when user has no connections", async () => {
      const res = await request(app)
        .get("/user/connections")
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("no data availbale in the requests");
    });

    it("should return accepted connections when connections exist", async () => {
      // User 1 sends request to User 2
      const sendRes = await request(app)
        .post(`/request/send/interested/${user2._id}`)
        .set("Cookie", user1Cookie);

      const requestId = sendRes.body.data._id;

      // User 2 accepts request
      await request(app)
        .post(`/request/review/accepted/${requestId}`)
        .set("Cookie", user2Cookie);

      // Check connections for User 2
      const res = await request(app)
        .get("/user/connections")
        .set("Cookie", user2Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Accepted requests retrieved successfully!");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(app).get("/user/connections");
      expect(res.statusCode).toBe(401);
    });
  });
});
