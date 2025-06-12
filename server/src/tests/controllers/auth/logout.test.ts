import request from "supertest";
import { getLoggedUserData } from "../../utils/user-helpers";
import { getApp } from "../../setup";
import { Session } from "../../../db/models/session";

describe("DELETE /api/auth/logout", () => {
  it("should log out successfully", async () => {
    const { user, accessToken, refreshToken } = await getLoggedUserData();

    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send();

    expect(response.status).toBe(200);

    const sessionsAmmount = await Session.count({
      where: { userId: user.userId },
    });

    expect(sessionsAmmount).toBe(0);
  });

  it("should return 401 if user is not authenticated", async () => {
    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .send();

    expect(response.status).toBe(401);
  });

  it("should return 401 if refresh token is not provided", async () => {
    const { accessToken } = await getLoggedUserData();

    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();
    expect(response.status).toBe(401);
  });

  it("should return 401 if refresh token invalid", async () => {
    const { accessToken } = await getLoggedUserData();

    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", "refreshToken=invalid_token")
      .send();

    expect(response.status).toBe(401);
  });
});
