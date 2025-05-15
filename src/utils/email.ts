import nodemailer from "nodemailer";
import settings from "../config/settings";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    // host: settings.SMTP_HOST,
    // port: Number(settings.SMTP_PORT),
    service: "gmail", // or use "smtp.your-provider.com"
    auth: {
      user: process.env.EMAIL_USER, // your email (e.g. example@gmail.com)
      pass: process.env.EMAIL_PASS, // your app password (not your email password)
    },
  });

  await transporter.sendMail({
    from: '"SocialChat" <noreply@socialchat.dev>',
    to: options.to,
    subject: options.subject,
    text: options.text,
  });
};
