import nodemailer from "nodemailer";
import { config } from "./config";
import handlebars from "nodemailer-handlebars";
import path from "path";

const transporter = nodemailer.createTransport({
  service: config.EMAIL_SERVICE,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

transporter.use(
  "compile",
  handlebars({
    viewEngine: {
      extname: ".handlebars",
      partialsDir: path.resolve("./src/email-templates/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/email-templates/"),
    extName: ".handlebars",
  }),
);

export default transporter;
