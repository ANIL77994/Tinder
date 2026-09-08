const request = require("supertest");
const app = require("../src/app");

describe("Profile API Endpoints", () => {
  let authCookie;

  const testUser = {
    firstName: "Alice",
    lastName: "Smith",
    email: "alice@example.com",
    password: "Password@123",
    age: 28,
    photoUrl: "https://example.com/alice.jpg",
  };

  beforeEach(async () => {
    await request(app).post("/signup").send(testUser);

    const loginRes = await request(app).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    authCookie = loginRes.headers["set-cookie"];
  });

  describe("GET /profile", () => {
    it("should return user profile when authenticated", async () => {
      const res = await request(app)
        .get("/profile")
        .set("Cookie", authCookie);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.firstName).toBe(testUser.firstName);
    });

    it("should return 401 when token is not provided", async () => {
      const res = await request(app).get("/profile");

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Token not provided");
    });

    it("should return 403 when token is invalid", async () => {
      const res = await request(app)
        .get("/profile")
        .set("Cookie", ["token=invalid_jwt_token; Path=/;"]);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toBe("Invalid or expired token");
    });
  });

  describe("PATCH /profile/edit", () => {
    it("should update allowed profile fields successfully", async () => {
      const updateData = {
        firstName: "Alicia",
        age: 29,
      };

      const res = await request(app)
        .patch("/profile/edit")
        .set("Cookie", authCookie)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Profile updated successfully");
      expect(res.body.data.firstName).toBe("Alicia");
      expect(res.body.data.age).toBe(29);
    });

    it("should reject updates containing disallowed fields (e.g. email)", async () => {
      const invalidUpdate = {
        email: "hacked@example.com",
      };

      const res = await request(app)
        .patch("/profile/edit")
        .set("Cookie", authCookie)
        .send(invalidUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Not Valid edit api");
    });

    it("should return 401 if unauthenticated", async () => {
      const res = await request(app)
        .patch("/profile/edit")
        .send({ firstName: "NewName" });

      expect(res.statusCode).toBe(401);
    });
  });
});
