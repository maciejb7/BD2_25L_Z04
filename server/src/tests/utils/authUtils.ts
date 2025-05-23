import bcrypt from "bcrypt";
import { Gender, Role, User } from "../../db/models/user";

export const createUser = async (
  nickname: string,
  email: string,
  password: string,
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name: "Janusz",
    surname: "Kowalski",
    nickname: nickname,
    email: email,
    password: hashedPassword,
    gender: Gender.M,
    birthDate: new Date("1990-01-01"),
    role: Role.USER,
  });
};
