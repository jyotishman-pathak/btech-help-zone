import nodemailer from "nodemailer";

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, FROM_EMAIL } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    console.log("----------------------------------------------------------");
    console.log(`[MAIL MOCK] To: ${to}`);
    console.log(`[MAIL MOCK] Subject: ${subject}`);
    console.log(`[MAIL MOCK] Body: ${html}`);
    console.log("----------------------------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || "587", 10),
    secure: SMTP_PORT === "465",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: FROM_EMAIL || SMTP_USER,
    to,
    subject,
    html,
  });
}
