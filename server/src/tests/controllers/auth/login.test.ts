import request from "supertest";
import { createUser } from "../../utils/authUtils";

import { User } from "../../../db/models/user";
import { getApp } from "../../setup";

beforeAll(async () => {
  await User.destroy({ where: {}, cascade: true });
});

afterEach(async () => {
  await User.destroy({ where: {}, cascade: true });
});

describe("POST /api/auth/login", () => {
  it("should login successfully with valid credentials by nickname", async () => {
    await createUser("Janusz", "janusz1990@gmail.com", "Haslo123@");
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
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

    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
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

  it("should return 401 for invalid credentials (wrong password)", async () => {
    await createUser("Janusz", "janusz1990@gmail.com", "Haslo123@");

    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: "Janusz",
        password: "WrongPassword",
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Nieprawidłowy login lub hasło.",
    );
  });

  it("should return 401 for invalid credentials (user not found)", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: "Genowefa",
        password: "SomePassword",
      });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Nieprawidłowy login lub hasło.",
    );
  });

  it("should return 400 for missing nicknameOrEmail", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        password: "Haslo123@",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Login nie może być puste.",
    );
  });

  it("should return 400 for missing password", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: "Janusz",
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Hasło nie może być puste.",
    );
  });

  it("should return 400 for empty request body", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "Login nie może być puste.",
    );
  });
});
