import nodemailer from "nodemailer";
import settings from "../config/settings";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: settings.SMTP_HOST,
    port: Number(settings.SMTP_PORT),
    auth: {
      user: settings.SMTP_USER,
      pass: settings.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: '"SocialChat" <noreply@socialchat.dev>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  });
};
