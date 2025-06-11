import path from "path";
import { config } from "../config";
import transporter from "../transporter";
import handlebars from "handlebars";
import fs from "fs";

/**
 *  Renders an email template using Handlebars.
 * @param name  - The name of the template file (without extension).
 * @param context  - The context object containing variables to replace in the template.
 * @returns  The rendered HTML string of the email template.
 */
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
  userName: string,
  email: string,
  resetLink: string,
) => {
  const html = renderEmailTemplate("password-reset", {
    userName,
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
  userName: string,
  email: string,
  activationLink: string,
) => {
  const html = renderEmailTemplate("account-activation", {
    userName,
    activationLink,
  });

  await transporter.sendMail({
    from: `"ClingClang" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Aktywacja Konta",
    html,
  });
};

const sendBanEmail = async (
  email: string,
  userName: string,
  adminName: string,
  banDate: string,
  banReason: string,
) => {
  const html = renderEmailTemplate("account-ban", {
    userName,
    adminName,
    banDate,
    banReason,
  });
  await transporter.sendMail({
    from: `"ClingClang" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Zablokowano Konto",
    html,
  });
};

const sendUnbanEmail = async (
  email: string,
  userName: string,
  adminName: string,
) => {
  const html = renderEmailTemplate("account-unban", {
    userName,
    adminName,
  });
  await transporter.sendMail({
    from: `"ClingClang" <${config.EMAIL_USER}>`,
    to: email,
    subject: "Odblokowano Konto",
    html,
  });
};

export const EmailService = {
  sendPasswordResetEmail,
  sendActivationEmail,
  sendBanEmail,
  sendUnbanEmail,
};
