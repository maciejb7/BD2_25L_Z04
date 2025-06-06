import { config } from "../config";
import transporter from "../transporter";
import nodemailer from "nodemailer";

interface MailWithTemplate extends nodemailer.SendMailOptions {
  template: string;
  context: Record<string, string>;
}

const sendPasswordResetEmail = async (
  username: string,
  email: string,
  resetLink: string,
) => {
  console.log(resetLink);

  await transporter.sendMail({
    from: `"ClingClang" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Reset Hasła",
    template: "password-reset",
    context: {
      username,
      resetLink,
    },
  } as MailWithTemplate);

  console.log(resetLink);
};

export const EmailService = {
  sendPasswordResetEmail,
};
