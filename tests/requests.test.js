const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");
const User = require("../src/models/users");

describe("Connection Requests API Endpoints", () => {
  let user1Cookie;
  let user2Cookie;
  let user1;
  let user2;

  beforeEach(async () => {
    // Create User 1
    await request(app).post("/signup").send({
      firstName: "User",
      lastName: "One",
      email: "user1@example.com",
      password: "Password@123",
      age: 24,
      photoUrl: "https://example.com/u1.jpg",
    });

    const login1 = await request(app).post("/login").send({
      email: "user1@example.com",
      password: "Password@123",
    });
    user1Cookie = login1.headers["set-cookie"];
    user1 = await User.findOne({ email: "user1@example.com" });

    // Create User 2
    await request(app).post("/signup").send({
      firstName: "User",
      lastName: "Two",
      email: "user2@example.com",
      password: "Password@123",
      age: 26,
      photoUrl: "https://example.com/u2.jpg",
    });

    const login2 = await request(app).post("/login").send({
      email: "user2@example.com",
      password: "Password@123",
    });
    user2Cookie = login2.headers["set-cookie"];
    user2 = await User.findOne({ email: "user2@example.com" });
  });

  describe("POST /request/send/:status/:toUserId", () => {
    it("should send an interested connection request successfully", async () => {
      const res = await request(app)
        .post(`/request/send/interested/${user2._id}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("interested");
      expect(res.body.data.toUserId.toString()).toBe(user2._id.toString());
    });

    it("should send an ignored connection request successfully", async () => {
      const res = await request(app)
        .post(`/request/send/ignored/${user2._id}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe("ignored");
    });

    it("should reject sending a request to oneself", async () => {
      const res = await request(app)
        .post(`/request/send/interested/${user1._id}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("You cannot send a connection request to yourself.");
    });

    it("should reject an invalid status", async () => {
      const res = await request(app)
        .post(`/request/send/invalid_status/${user2._id}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("Invalid status type");
    });

    it("should return 404 if recipient user does not exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/request/send/interested/${fakeId}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found.");
    });

    it("should reject duplicate connection requests", async () => {
      await request(app)
        .post(`/request/send/interested/${user2._id}`)
        .set("Cookie", user1Cookie);

      const res = await request(app)
        .post(`/request/send/interested/${user2._id}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Connection request already exists between these users.");
    });
  });

  describe("POST /request/review/:status/:requestId", () => {
    let requestId;

    beforeEach(async () => {
      const sendRes = await request(app)
        .post(`/request/send/interested/${user2._id}`)
        .set("Cookie", user1Cookie);
      requestId = sendRes.body.data._id;
    });

    it("should allow receiver to accept a pending connection request", async () => {
      const res = await request(app)
        .post(`/request/review/accepted/${requestId}`)
        .set("Cookie", user2Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("accepted");
      expect(res.body.data.status).toBe("accepted");
    });

    it("should allow receiver to reject a pending connection request", async () => {
      const res = await request(app)
        .post(`/request/review/rejected/${requestId}`)
        .set("Cookie", user2Cookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain("rejected");
      expect(res.body.data.status).toBe("rejected");
    });

    it("should reject review with an invalid status", async () => {
      const res = await request(app)
        .post(`/request/review/interested/${requestId}`)
        .set("Cookie", user2Cookie);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid status. Must be accepted or rejected.");
    });

    it("should reject review if request is not found or not intended for the user", async () => {
      // User 1 is sender, not receiver
      const res = await request(app)
        .post(`/request/review/accepted/${requestId}`)
        .set("Cookie", user1Cookie);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("No pending connection request found for this user.");
    });
  });
});
