import request from "supertest";
import { getLoggedUserData } from "../../utils/user-helpers";
import { getApp } from "../../setup";
import { Session } from "../../../db/models/session";
import { User } from "../../../db/models/user";

describe("POST /api/user/delete-account", () => {
  it("should delete the account successfully", async () => {
    const { user, accessToken, refreshToken } = await getLoggedUserData();

    const response = await request(await getApp())
      .post("/api/user/delete-account")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send({
        nickname: user.nickname,
        password: "Haslo123@",
      });
    expect(response.status).toBe(200);

    const sessionCount = await Session.count({
      where: {
        userId: user.userId,
      },
    });

    expect(sessionCount).toBe(0);

    const deletedUser = await User.findOne({
      where: {
        userId: user.userId,
      },
    });
    expect(deletedUser).toBeNull();
  });

  it("should return 401 if user is not authenticated", async () => {
    const response = await request(await getApp())
      .post("/api/user/delete-account")
      .send({
        nickname: "Tadeusz",
        password: "Haslo123@",
      });
    expect(response.status).toBe(401);
  });

  it("should return 400 if nickname is not provided", async () => {
    const { accessToken, refreshToken } = await getLoggedUserData();
    const response = await request(await getApp())
      .post("/api/user/delete-account")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send({
        password: "Haslo123@",
      });
    expect(response.status).toBe(400);
  });

  it("should return 400 if password is not provided", async () => {
    const { accessToken, refreshToken } = await getLoggedUserData();
    const response = await request(await getApp())
      .post("/api/user/delete-account")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send({
        nickname: "Tadeusz",
      });
    expect(response.status).toBe(400);
  });

  it("should return 400 if nickname is incorrect", async () => {
    const { accessToken, refreshToken } = await getLoggedUserData();
    const response = await request(await getApp())
      .post("/api/user/delete-account")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send({
        nickname: "Tadeusz123",
        password: "Haslo123@",
      });
    expect(response.status).toBe(400);
  });

  it("should return 400 if password is incorrect", async () => {
    const { user, accessToken, refreshToken } = await getLoggedUserData();

    const response = await request(await getApp())
      .post("/api/user/delete-account")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", `refreshToken=${refreshToken}`)
      .send({
        nickname: user.nickname,
        password: "WrongPassword",
      });
    expect(response.status).toBe(401);
  });
});
