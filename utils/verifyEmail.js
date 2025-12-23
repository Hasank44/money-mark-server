import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import "dotenv/config";

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const FRONT_URL = process.env.FRONT_URL;

export const verifyEmail = async (otp, email, name) => {
  // Read email template
  let emailTemplate;
  try {
    emailTemplate = fs.readFileSync(path.join(__dirName, "verifyEmail.hbs"), "utf-8");
  } catch (err) {
    console.error("❌ Email template not found:", err.message);
    return { success: false, error: "Email template missing" };
  };
  const template = handlebars.compile(emailTemplate);
  const htmlToSend = template({
    name,
    url: FRONT_URL,
    otp,
    year: new Date().getFullYear(),
    siteName: process.env.FROM_NAME
  });
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
        to: [{ email }],
        subject: "Verify Your Email",
        htmlContent: htmlToSend
      },
      {
        headers: {
          "api-key": process.env.EMAIL_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Verification Email Sent:", response.data);
    return { success: true };
  } catch (err) {
    console.error("❌ Mail send failed:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};
