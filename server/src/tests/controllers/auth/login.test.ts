import request from "supertest";
import { createUser } from "../../utils/user-helpers";
import { getApp } from "../../setup";

describe("POST /api/auth/login", () => {
  it("should login successfully with valid credentials by nickname", async () => {
    const user = await createUser();
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: user.nickname,
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
    expect(response.body.user).toHaveProperty("nickname", user.nickname);
    expect(response.body.user).toHaveProperty("email", user.email);
  });

  it("should login successfully with valid credentials by email", async () => {
    const user = await createUser();

    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: user.email,
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
    expect(response.body.user).toHaveProperty("nickname", user.nickname);
    expect(response.body.user).toHaveProperty("email", user.email);
  });

  it("should return 401 for invalid credentials (wrong password)", async () => {
    const user = await createUser();

    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: user.nickname,
        password: "WrongPassword",
      });
    expect(response.status).toBe(401);
  });

  it("should return 401 for invalid credentials (user not found)", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: "Genowefa",
        password: "SomePassword",
      });
    expect(response.status).toBe(401);
  });

  it("should return 400 for missing nicknameOrEmail", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        password: "Haslo123@",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 for missing password", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({
        nicknameOrEmail: "Janusz",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 for empty request body", async () => {
    const response = await request(await getApp())
      .post("/api/auth/login")
      .send({});

    expect(response.status).toBe(400);
  });
});
