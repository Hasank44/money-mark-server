import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import "dotenv/config";

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

export const sendOtpEmail = async (email, name, otp) => {
  let templateSource;
  try {
    const templatePath = path.join(__dirName, "sendOtpEmail.hbs");
    templateSource = fs.readFileSync(templatePath, "utf-8");
  } catch (err) {
    console.error("❌ Email template not found:", err.message);
    return { success: false, error: "Email template missing" };
  }

  const template = handlebars.compile(templateSource);
  const htmlToSend = template({
    name,
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
        subject: "Your OTP Code 🔐",
        htmlContent: htmlToSend
      },
      {
        headers: {
          "api-key": process.env.EMAIL_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ OTP Sent Success:", response.data);
    return { success: true };
  } catch (err) {
    console.error("❌ OTP email failed:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};