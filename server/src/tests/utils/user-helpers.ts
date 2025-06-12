import request from "supertest";
import bcrypt from "bcrypt";
import { Gender, Role, User } from "../../db/models/user";
import { getApp } from "../setup";

/**
 * Creates a new user in the database with the given nickname, email, and password.
 * @param nickname
 * @param email
 * @param password
 * @returns User added to the database.
 */
export const createUser = async (password = "Haslo123@"): Promise<User> => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const unique = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const nickname = `user_${unique}A1!`;
  const email = `user${unique}@email.com`;

  const user = await User.create({
    name: "Janusz",
    surname: "Kowalski",
    nickname: nickname,
    email: email,
    password: hashedPassword,
    gender: Gender.M,
    birthDate: new Date("1990-01-01"),
    role: Role.USER,
    isActive: true,
  });

  return user;
};

export const extractRefreshToken = (
  response: request.Response,
): string | null => {
  const cookies = Array.isArray(response.headers["set-cookie"])
    ? response.headers["set-cookie"]
    : [response.headers["set-cookie"] ?? ""];

  const tokenCookie = cookies.find((cookie) =>
    cookie?.startsWith("refreshToken="),
  );

  return tokenCookie?.split(";")[0].split("=")[1] ?? null;
};

export const getLoggedUserData = async (
  password = "Haslo123@",
): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string | null;
}> => {
  const user = await createUser();

  const loginResponse = await request(await getApp())
    .post("/api/auth/login")
    .send({
      nicknameOrEmail: user.nickname,
      password: password,
    });

  const accessToken = loginResponse.body.accessToken;
  const refreshToken = extractRefreshToken(loginResponse);

  return { user, accessToken, refreshToken };
};
