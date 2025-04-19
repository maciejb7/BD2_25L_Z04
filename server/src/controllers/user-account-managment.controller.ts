// import { Request, Response } from "express";
// import { ValidationService } from "../services/validation.service";
// import { Op } from "sequelize";
// import { User } from "../db/models/user";
// import { NoPermissionsError, UserNotFoundError } from "../errors/errors";

// export class UserAccountManagmentController {
//   static async deleteAccount(req: Request, res: Response) {
//     try {
//         const userId = req.user?.userId;
//         const nicknameOrEmail = req.body.nicknameOrEmail;
//         const password = req.body.password;

//         ValidationService.isStringFieldValid(nicknameOrEmail, "Login");
//         ValidationService.isStringFieldValid(password, "Hasło");

//         const user = await User.findOne({
//                 where: {
//                   [Op.or]: [{ nickname: nicknameOrEmail }, { email: nicknameOrEmail }],
//                 },
//               });

//         if (!user)
//             throw new UserNotFoundError("Nie znaleziono użytkownika.", 404, nicknameOrEmail);

//         if (userId !== user.id)
//             throw new NoPermissionsError("Nie masz uprawnień do usunięcia konta innego użytkownika.", 403, );
//   }
// }
