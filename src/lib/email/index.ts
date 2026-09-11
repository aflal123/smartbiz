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

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<boolean> {
  const transporter = getMailTransporter();
  const from = process.env.EMAIL_FROM || "SmartBiz <noreply@smartbiz.com>";

  // If no SMTP configured (e.g. development testing), log delivery event without leaking OTP in prod
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Dev Mailer] OTP for ${to}: ${otp}`);
    }
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "SmartBiz — Your Verification Code",
      html: `
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
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  otp: string
): Promise<boolean> {
  const transporter = getMailTransporter();
  const from = process.env.EMAIL_FROM || "SmartBiz <noreply@smartbiz.com>";

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Dev Mailer] Password Reset OTP for ${to}: ${otp}`);
    }
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject: "SmartBiz — Password Reset Code",
      html: `
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
      `,
    });
    return true;
  } catch (error) {
    console.error("Failed to send Password Reset email:", error);
    return false;
  }
}
