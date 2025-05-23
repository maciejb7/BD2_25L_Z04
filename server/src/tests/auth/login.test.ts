import request from "supertest";
import { createUser } from "../utils/authUtils";
import { app } from "../setup";
import { User } from "../../db/models/user";

beforeAll(async () => {
  await User.destroy({ truncate: true, cascade: true });
});

afterEach(async () => {
  await User.destroy({ truncate: true, cascade: true });
});

describe("POST /api/auth/login", () => {
  it("should login successfully with valid credentials by nickname", async () => {
    await createUser("Janusz", "janusz1990@gmail.com", "Haslo123@");
    const response = await request(app).post("/api/auth/login").send({
      nicknameOrEmail: "Janusz",
      password: "Haslo123@",
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("user");
    const rawSetCookie = response.headers["set-cookie"];
    const cookies = Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie];
    expect(cookies.some((cookie) => cookie.startsWith("refreshToken="))).toBe(
      true,
    );
    expect(response.body.user).toHaveProperty("nickname", "Janusz");
    expect(response.body.user).toHaveProperty("email", "janusz1990@gmail.com");
  });

  it("should login successfully with valid credentials by email", async () => {
    await createUser("Janusz", "janusz1990@gmail.com", "Haslo123@");

    const response = await request(app).post("/api/auth/login").send({
      nicknameOrEmail: "janusz1990@gmail.com",
      password: "Haslo123@",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("user");
    const rawSetCookie = response.headers["set-cookie"];
    const cookies = Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie];
    expect(cookies.some((cookie) => cookie.startsWith("refreshToken="))).toBe(
      true,
    );
    expect(response.body.user).toHaveProperty("nickname", "Janusz");
    expect(response.body.user).toHaveProperty("email", "janusz1990@gmail.com");
  });
});
