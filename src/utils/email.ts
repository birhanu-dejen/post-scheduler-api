import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, //true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: MailOptions) => {
  const mailOptions = {
    from: `"Post Scheduler App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", (error as Error).message);
    throw error;
  }
};
