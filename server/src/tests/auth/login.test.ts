import request from "supertest";
import { createUser } from "../utils/authUtils";
import { database } from "../../db/database";
import { app } from "../setup";

beforeAll(async () => {
  await database.sync({ force: true });
});

describe("POST /api/auth/login", () => {
  it("should login successfully with valid credentials", async () => {
    await createUser("janusz", "janusz1990@gmail.com", "Haslo123@");

    const response = await request(app).post("/api/auth/login").send({
      nicknameOrEmail: "janusz1990@gmail.com",
      password: "Haslo123@",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("user");

    expect(response.body.user).toHaveProperty("nickname", "janusz");
    expect(response.body.user).toHaveProperty("email", "janusz1990@gmail.com");
  });
});
