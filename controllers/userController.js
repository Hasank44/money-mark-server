import mongoose from "mongoose";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import { verifyEmail } from "../utils/verifyEmail.js";
import { sendPasswordResetSuccessEmail } from "../utils/passwordReset.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import registerValidate from "../validators/registerValidator.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import { sendPasswordChangedEmail } from "../utils/passwordChanged.js";
import generateUniqueReferralCode from "../config/generateUniqueReferralCode.js";
import verifyPhone from "../middlewares/verifyPhone.js";

const secret = process.env.JWT_SECRET;

export const getUser = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.isVerified === false) {
      return res.status(400).json({
        message: "Verify your email first",
      });
    }
    if (user.status === "Inactive") {
      return res.status(400).json({
        message: "Active your account first",
      });
    }
    if (user.isLoggedIn === false) {
      return res.status(400).json({
        message: "login your account first",
      });
    }
    return res.status(200).json({
      message: "User Retrieved success",
      result: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userRegister = async (req, res) => {
  try {
    const {
      email,
      country,
      phoneNumber,
      password,
      confirmPassword,
      referCode,
      userName,
    } = req.body;

    // Validation
    const validate = registerValidate({
      email,
      country,
      phoneNumber,
      password,
      confirmPassword,
      referCode,
      userName,
    });
    if (!validate.isValid) return res.status(400).json(validate.error);
    const phoneValid = verifyPhone({phone: phoneNumber, country});
    if (!phoneValid.valid) {
      return res.status(400).json({
        message: "Phone number doesn't match the country"
      });
    }
    // Duplicate checks
    const isEmail = await User.findOne({ email });
    if (isEmail && isEmail.isVerified === false) {
      return res.status(400).json({
        message: "Verify your email",
      });
    }
    if (isEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (await User.findOne({ userName }))
      return res.status(400).json({ message: "Username already exists" });
    if (await User.findOne({ phoneNumber }))
      return res.status(400).json({ message: "Phone number already exists" });

    const myReferCode = await generateUniqueReferralCode();
    let referredBy = null;
    let referLabel1 = [];
    let referLabel2 = [];
    let referLabel3 = [];
    if (referCode) {
      const parentUser = await User.findOne({ referCode }).select(
        "_id referCode referredBy"
      );
      if (!parentUser) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
      referredBy = parentUser.referCode;
      await User.updateOne(
        { _id: parentUser._id },
        { $push: { referLabel1: myReferCode } }
      );
      if (parentUser.referredBy) {
        const grandParentUser = await User.findOne({
          referCode: parentUser.referredBy,
        }).select("_id referredBy");
        if (grandParentUser) {
          await User.updateOne(
            { _id: grandParentUser._id },
            { $push: { referLabel2: myReferCode } }
          );
          if (grandParentUser.referredBy) {
            await User.updateOne(
              { referCode: grandParentUser.referredBy },
              { $push: { referLabel3: myReferCode } }
            );
          }
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 11);
    const myReferLink = `/user/register?referBy=${myReferCode}`;
    const newUser = new User({
      email,
      userName,
      country,
      phoneNumber: phoneValid.international,
      password: hashedPassword,
      referCode: myReferCode,
      referLink: myReferLink,
      referredBy,
      referLabel1, // remains empty
      referLabel2, // remains empty
      referLabel3, // remains empty
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    newUser.otp = otp;
    newUser.otpVerified = false;
    newUser.otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    await newUser.save();
    await verifyEmail(otp, newUser.email, newUser.userName);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      result: newUser.email,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userEmailVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    if (!otp)
      return res.status(400).json({
        message: "Invalid OTP",
      });
    if (typeof otp !== "string" || typeof email !== "string") {
      return res.status(400).json({
        message: "Enter valid otp and email",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "email not found",
      });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: "Account not found",
      });

    if (!user.otp || !user.otpExpire)
      return res.status(400).json({
        message: "Invalid credentials",
      });

    if (new Date(user.otpExpire) < new Date())
      return res.status(400).json({
        message: "OTP has expired",
      });

    if (otp.toString() !== user.otp.toString())
      return res.status(400).json({
        message: "Invalid OTP",
      });

    if (user.isVerified)
      return res.status(400).json({
        message: "Your account is already verified",
      });

    user.otp = null;
    user.otpExpire = null;
    user.isVerified = true;
    await user.save();
    sendWelcomeEmail(user.email, user.userName);

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

export const userReSendOtp = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email)
      return res.status(400).json({
        message: "Invalid credentials",
      });
    if (!validator.isEmail(email))
      return res.status(400).json({
        message: "Email is not valid",
      });
    if (!typeof email === String) {
      return res.status(400).json({
        message: "Enter valid otp and email",
      });
    }
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: "Account not found",
      });
    if (user.otpExpire && new Date(user.otpExpire) > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Please wait.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();
    sendOtpEmail(user.email, user.userName, user.otp);
    return res.status(200).json({
      success: true,
      message: "OTP re-sent successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || !validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect Email or password",
      });
    }
    if (typeof password !== "string" || typeof email !== "string") {
      return res.status(400).json({
        message: "Enter valid password and email",
      });
    }
    if (user.isVerified !== true) {
      return res.status(400).json({
        message: "Please verify your account",
      });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword || !user.password) {
      return res.status(400).json({
        message: "Incorrect Password",
      });
    }
    await Session.deleteMany({ userId: user._id });
    const newSession = new Session({ userId: user._id });
    await newSession.save();
    const accessToken = jwt.sign({ _id: user._id }, secret, {
      expiresIn: "15h",
    });
    const refreshToken = jwt.sign({ _id: user._id }, secret, {
      expiresIn: "15h",
    });

    user.isLoggedIn = true;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Login success",
      result: user,
      accessToken: `Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error Occurred",
    });
  }
};

export const userLogout = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!_id) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return res.status(400).json({
        message: "account not found",
      });
    }
    const session = await Session.findOne({ userId: user._id });
    if (session) {
      await Session.deleteMany({ userId: user._id });
    }
    user.isLoggedIn = false;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Logout Success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userForgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    if (typeof email !== "string") {
      return res.status(400).json({
        message: "Enter valid email",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "email not valid",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "account not found",
      });
    }
    if (user.otpExpire && new Date(user.otpExpire) > new Date()) {
      return res.status(400).json({
        message: "OTP already sent. Please wait.",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expired = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = otp;
    user.otpExpire = expired;
    await user.save();
    sendOtpEmail(user.email, user.userName, user.otp);
    return res.status(200).json({
      success: true,
      message: "Otp Sent Success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userOtpVerify = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;
    if (!otp || !email) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "email not valid",
      });
    }
    if (typeof otp !== "string" || typeof email !== "string") {
      return res.status(400).json({
        message: "Enter valid otp and email",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "account not found",
      });
    }
    if (!user.otp || !user.otpExpire) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }
    if (otp !== user.otp) {
      return res.status(400).json({
        message: "invalid OTP",
      });
    }
    user.otp = null;
    user.otpVerified = true;
    const expired = new Date(Date.now() + 10 * 60 * 1000);
    user.otpExpire = expired;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "OTP verify success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userSetNewPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.params;
    if (!newPassword || !confirmPassword || !email) {
      return res.status(400).json({
        message: "all field are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "password do not match",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "email not valid",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 11);
    if (typeof hashedPassword !== "string" || typeof email !== "string") {
      return res.status(400).json({
        message: "Enter valid password and email",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "account not found",
      });
    }
    if (user.otpVerified !== true) {
      return res.status(400).json({
        message: "Please sent OTP then forget password",
      });
    }
    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }
    user.password = hashedPassword;
    user.otpExpire = null;
    user.otpVerified = false;
    await user.save();
    sendPasswordResetSuccessEmail(user.email, user.userName);
    return res.status(200).json({
      success: true,
      message: "Password reset success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userPasswordChange = async (req, res) => {
  try {
    const { _id } = req.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!_id) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "new password do not match",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "invalid user",
      });
    }
    if (
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Enter valid passwords",
      });
    }
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return res.status(400).json({
        message: "user not found",
      });
    }
    const isPassword = bcrypt.compare(newPassword, user.password);
    if (!isPassword) {
      return res.status(400).json({
        message: "incorrect password",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 11);
    user.password = hashedPassword;
    await user.save();
    sendPasswordChangedEmail(user.email, user.userName);
    return res.status(200).json({
      success: true,
      message: "Password Change success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userProfileUpdate = async (req, res) => {
  try {
    const { _id } = req.user;
    const { fullName, email, phoneNumber } = req.body;
    if (!_id) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }
    if (!fullName || !email || !phoneNumber) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email formate",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "invalid user",
      });
    }
    if (
      typeof fullName !== "string",
      typeof email !== "string" ||
      typeof phoneNumber !== "string"
    ) {
      return res.status(400).json({
        message: "Enter valid Formate",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.status !== "Active") {
      return res.status(404).json({
        message: "Your account is inactive or disabled",
      });
    }
    const updated = await User.findOneAndUpdate(
      {
        _id: _id,
      },
      {
        $set: {
          fullName: fullName,
          email: email,
          phoneNumber: phoneNumber,
        },
      }
    );
    await updated.save();
    return res.status(200).json({
      result: updated,
      message: "Profile update success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userWalletUpdateByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const toNumber = (v) => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };
    const {
      balance,
      gmailEarn,
      facebookEarn,
      telegramEarn,
      instagramEarn,
      referEarn,
      giftEarn,
      editEarn,
      marketingEarn,
      writingEarn,
      designEarn,
      microJobEarn,
      dataEntryEarn,
      googleJobEarn,
      generalEarn,
      proEarn,
      freeEarn,
      salaryEarn,
    } = req.body;

    const data = {
      balance: toNumber(balance),
      gmailEarn: toNumber(gmailEarn),
      facebookEarn: toNumber(facebookEarn),
      telegramEarn: toNumber(telegramEarn),
      instagramEarn: toNumber(instagramEarn),
      referEarn: toNumber(referEarn),
      giftEarn: toNumber(giftEarn),
      editEarn: toNumber(editEarn),
      marketingEarn: toNumber(marketingEarn),
      writingEarn: toNumber(writingEarn),
      designEarn: toNumber(designEarn),
      microJobEarn: toNumber(microJobEarn),
      dataEntryEarn: toNumber(dataEntryEarn),
      googleJobEarn: toNumber(googleJobEarn),
      generalEarn: toNumber(generalEarn),
      proEarn: toNumber(proEarn),
      freeEarn: toNumber(freeEarn),
      salaryEarn: toNumber(salaryEarn),
    };
    const hasNegative = Object.values(data).some(v => v < 0);
    if (hasNegative) {
      return res.status(400).json({
        message: "Earnings cannot be negative",
      });
    };
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    return res.status(200).json({
      success: true,
      message: "Wallet updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error occurred",
    });
  }
};