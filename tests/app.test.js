const request = require("supertest");
const app = require("../server");

let token = "";
let taskId = "";

describe("Tracker API", () => {

  // 🔹 Health check
  test("GET / should work", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  // 🔹 Register user
  test("POST /register", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    expect([200, 400]).toContain(res.statusCode);
  });

  // 🔹 Login user
  test("POST /login", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        email: "test@example.com",
        password: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");

    token = res.body.token;
  });

  // 🔹 Unauthorized access
  test("GET /tasks without token should fail", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
  });

  // 🔹 Get tasks (authorized)
  test("GET /tasks (authorized)", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
  });

  // 🔹 Create task
  test("POST /tasks", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", token)
      .send({
        text: "Test Task",
        cat: "task",
        date: "2026-05-06"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id");

    taskId = res.body._id;
  });

  // 🔹 Toggle task
  test("PUT /tasks/:id", async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
  });

  // 🔹 Delete task
  test("DELETE /tasks/:id", async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", token);

    expect(res.statusCode).toBe(200);
  });

});


// 🔹 Cleanup (VERY IMPORTANT)
afterAll(async () => {
  const mongoose = require("mongoose");
  const client = require("prom-client");

  await mongoose.connection.close();
  client.register.clear();
});