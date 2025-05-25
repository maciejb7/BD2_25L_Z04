import request from "supertest";
import { getLoggedUserData } from "../../utils/userHelpers";
import { getApp } from "../../setup";
import { User } from "../../../db/models/user";
import { Session } from "../../../db/models/session";

describe("DELETE /api/auth/logout", () => {
  it("should log out successfully", async () => {
    const { user, accessToken, refreshToken } = await getLoggedUserData(
      "Mariusz",
      "mariusz1990@gmail.com",
      "Haslo123@",
    );

    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Wylogowano pomyślnie.");

    const sessionsAmmount = await Session.count({
      where: { userId: user.userId },
    });

    expect(sessionsAmmount).toBe(0);

    await User.destroy({
      where: { nickname: "Mariusz" },
    });
  });

  it("should return 401 if user is not authenticated", async () => {
    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .send();

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Brak autoryzacji.");
  });

  it("should return 401 if refresh token is not provided", async () => {
    const { accessToken } = await getLoggedUserData(
      "Mariusz",
      "mariusz1990@gmail.com",
      "Haslo123@",
    );

    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Nie jesteś zalogowany.");

    await User.destroy({
      where: { nickname: "Mariusz" },
    });
  });

  it("should return 401 if refresh token invalid", async () => {
    const { accessToken } = await getLoggedUserData(
      "Mariusz",
      "mariusz1990@gmail.com",
      "Haslo123@",
    );

    const response = await request(await getApp())
      .delete("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", "refreshToken=invalid_token")
      .send();

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Nie jesteś zalogowany.");
    await User.destroy({
      where: { nickname: "Mariusz" },
    });
  });
});
