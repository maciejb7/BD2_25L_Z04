import request from "supertest";
import { User } from "../../../db/models/user";
import { getApp } from "../../setup";
import { createUser, getLoggedUserData } from "../../utils/userHelpers";
import { Session } from "../../../db/models/session";
import { DateTime } from "luxon";

describe("POST /api/auth/refresh", () => {
  it("should refresh the access token successfully with a valid refresh token", async () => {
    const { refreshToken } = await getLoggedUserData(
      "Genowefa",
      "genowefa1990@gmail.com",
      "Haslo123@",
    );

    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty(
      "message",
      "Odświeżono token dostępu.",
    );

    await User.destroy({ where: { nickname: "Genowefa" } });
  });

  it("should return 401 if refresh token is not provided", async () => {
    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .send();
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Nie jesteś zalogowany.");
  });

  it("should return 401 if refresh token is invalid", async () => {
    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .set("Cookie", "refreshToken=invalid_token")
      .send();
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Twoja sesja wygasła. Zaloguj się ponownie.",
    );
  });

  it("should return 401 if refresh token is expired", async () => {
    const user = await createUser(
      "Genowefa",
      "genowefa1990@gmail.com",
      "Haslo123@",
    );

    const session = await Session.create({
      refreshToken: "expired_token",
      expiresAt: DateTime.now().minus({ days: 30 }).toJSDate(),
      UserId: user.userId,
    });

    const refreshToken = session.refreshToken;

    const response = await request(await getApp())
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send();
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      "Twoja sesja wygasła. Zaloguj się ponownie.",
    );

    await User.destroy({ where: { nickname: "Genowefa" } });
  });
});
