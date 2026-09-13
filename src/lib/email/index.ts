import { Resend } from "resend";
import nodemailer from "nodemailer";

function getMailTransporter() {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes("sample@")) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes("sample")) {
    return null;
  }
  return new Resend(apiKey);
}

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<boolean> {
  // Always log OTP in dev console for instant testing
  console.log(`\n========================================`);
  console.log(`[SmartBiz Mailer] 🔑 OTP Code for ${to}: ${otp}`);
  console.log(`========================================\n`);

  const from = process.env.EMAIL_FROM || "SmartBiz <aflalahamed100@gmail.com>";
  const subject = "SmartBiz — Your Verification Code";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="margin-bottom: 24px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 700;">SmartBiz</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Business Management Suite</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Your one-time verification code is:</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in <strong>10 minutes</strong>. If you did not request this verification, please disregard this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">SmartBiz Cloud ERP • Automated System Message</p>
    </div>
  `;

  // Priority 1: Gmail SMTP Transporter
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log(`[Gmail SMTP] OTP email delivered to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error("[Gmail SMTP Error]:", err);
    }
  }

  // Priority 2: Resend API Client
  const resend = getResendClient();
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: "SmartBiz <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      });
      if (res.error) {
        console.warn("[Resend API Error]:", res.error.message || res.error);
      } else {
        console.log(`[Resend API] OTP email delivered to ${to}. Message ID: ${res.data?.id}`);
        return true;
      }
    } catch (err) {
      console.warn("[Resend API Exception]:", err);
    }
  }

  return true;
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  otp: string
): Promise<boolean> {
  console.log(`\n========================================`);
  console.log(`[SmartBiz Mailer] 🔑 Password Reset OTP for ${to}: ${otp}`);
  console.log(`========================================\n`);

  const from = process.env.EMAIL_FROM || "SmartBiz <aflalahamed100@gmail.com>";
  const subject = "SmartBiz — Password Reset Code";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="margin-bottom: 24px;">
        <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 700;">SmartBiz</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Security & Password Recovery</p>
      </div>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to reset your password. Enter the following code to continue:</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: monospace;">${otp}</span>
      </div>
      <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code expires in <strong>10 minutes</strong>. Never share this code with anyone.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; margin: 0;">SmartBiz Cloud ERP • Security Team</p>
    </div>
  `;

  const transporter = getMailTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log(`[Gmail SMTP] Password Reset email delivered to ${to}. Message ID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error("[Gmail SMTP Error]:", err);
    }
  }

  const resend = getResendClient();
  if (resend) {
    try {
      const res = await resend.emails.send({
        from: "SmartBiz <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      });
      if (res.error) {
        console.warn("[Resend API Error]:", res.error.message || res.error);
      } else {
        console.log(`[Resend API] Password Reset email delivered to ${to}. Message ID: ${res.data?.id}`);
        return true;
      }
    } catch (err) {
      console.warn("[Resend API Exception]:", err);
    }
  }

  return true;
}
