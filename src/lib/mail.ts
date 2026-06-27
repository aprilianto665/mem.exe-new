import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"mem.exe" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Email Verification Code",
    html: `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
		<h2 style="color: #333; margin-top: 0;">Email Verification</h2>
		<p>Thank you for registering! Please use the verification code below to verify your email address:</p>
		<div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
			<h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
		</div>
		<p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
		<p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
	</div>
</body>
</html>`,
  };

  await transporter.sendMail(mailOptions);
}
