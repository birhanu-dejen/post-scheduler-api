// src/services/email.service.ts
import { sendEmail } from "../utils/email";
import { compileTemplate } from "../utils/templateCompiler";

export async function sendSignUpVerification(
  email: string,
  name: string,
  verificationLink: string
) {
  const html = compileTemplate("signupVerification", {
    name,
    verificationLink,
  });
  return sendEmail({
    to: email,
    subject: "Welcome to Devify - Verify Your Email",
    html,
  });
}

export async function sendForgotPassword(email: string, resetUrl: string) {
  const html = compileTemplate("forgotPassword", { resetUrl });
  return sendEmail({ to: email, subject: "Devify Password Reset", html });
}

export async function sendPostPublishedNotification(
  email: string,
  postTitle: string,
  postUrl: string
) {
  const html = compileTemplate("postPublished", { postTitle, postUrl });
  return sendEmail({
    to: email,
    subject: `Your post "${postTitle}" is live!`,
    html,
  });
}
