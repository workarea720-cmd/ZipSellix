import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"PakDrop Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your Email - PakDrop",
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to PakDrop!</h2>
        <p>Please click the button below to verify your email address and activate your account.</p>
        <a href="${confirmLink}" style="background-color: #059669; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
    });
};