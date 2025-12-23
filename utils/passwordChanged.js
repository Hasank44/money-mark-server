import axios from "axios";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import "dotenv/config";

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);

export const sendPasswordChangedEmail = async (email, name) => {
  // Read & compile template
  let templateSource;
  try {
    const templatePath = path.join(__dirName, "views", "passwordChanged.hbs");
    templateSource = fs.readFileSync(templatePath, "utf-8");
  } catch (err) {
    console.error("❌ Email template not found:", err.message);
    return { success: false, error: "Email template missing" };
  }

  const template = handlebars.compile(templateSource);
  const html = template({
    name: name,
    year: new Date().getFullYear(),
    siteName: process.env.FROM_NAME
  });
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: process.env.FROM_NAME, email: process.env.FROM_EMAIL },
        to: [{ email: email }],
        subject: "Your Password Has Been Updated - ShipWave",
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.EMAIL_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Password change mail sent:", response.data);
    return { success: true };
  } catch (err) {
    console.error("❌ Failed to send password change mail:", err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || err.message };
  }
};