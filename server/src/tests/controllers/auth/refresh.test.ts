import request from "supertest";
import { getApp } from "../../setup";
import { createUser, getLoggedUserData } from "../../utils/user-helpers";
import { Session } from "../../../db/models/session";
import { DateTime } from "luxon";

describe("POST /api/auth/refresh", () => {
  it("should refresh the access token successfully with a valid refresh token", async () => {
    const { refreshToken } = await getLoggedUserData();

    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("should return 401 if refresh token is not provided", async () => {
    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .send();
    expect(response.status).toBe(401);
  });

  it("should return 401 if refresh token is invalid", async () => {
    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .set("Cookie", "refreshToken=invalid_token")
      .send();
    expect(response.status).toBe(401);
  });

  it("should return 401 if refresh token is expired", async () => {
    const user = await createUser();

    const session = await Session.create({
      refreshToken: "expired_token",
      expiresAt: DateTime.now().minus({ days: 30 }).toJSDate(),
      userId: user.userId,
    });

    const refreshToken = session.refreshToken;

    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send();
    expect(response.status).toBe(401);
  });
});
