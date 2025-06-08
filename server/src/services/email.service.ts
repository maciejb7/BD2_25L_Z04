import path from "path";
import { config } from "../config";
import transporter from "../transporter";
import handlebars from "handlebars";
import fs from "fs";

const renderEmailTemplate = (name: string, context: Record<string, string>) => {
  const templatePath = path.resolve(
    "./src/email-templates/",
    `${name}.handlebars`,
  );
  const templateFile = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(templateFile);
  return template(context);
};

const sendPasswordResetEmail = async (
  username: string,
  email: string,
  resetLink: string,
) => {
  const html = renderEmailTemplate("password-reset", {
    username,
    resetLink,
  });

  await transporter.sendMail({
    from: `"ClingClang" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Reset Hasła",
    html,
  });
};

const sendActivationEmail = async (
  username: string,
  email: string,
  activationLink: string,
) => {
  const html = renderEmailTemplate("account-activation", {
    username,
    activationLink,
  });

  await transporter.sendMail({
    from: `"ClingClang" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Aktywacja Konta",
    html,
  });
};

export const EmailService = {
  sendPasswordResetEmail,
  sendActivationEmail,
};
