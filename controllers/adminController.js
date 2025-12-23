import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import validator from "validator";
import jwt from "jsonwebtoken";

let SECRET = process.env.JWT_SECRET;

export const userGetAllByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }
    const admin = await User.findById(_id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      result: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error occurred",
    });
  }
};

export const userGetOneByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "Unauthorized request",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User Are Here",
      result: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const userUpdateByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const { role, accountStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized request",
      });
    }
    const admin = await User.findById(_id);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
    if (typeof role !== "string") {
      return res.status(400).json({ message: "Role must be a string" });
    }
    if (typeof accountStatus !== "string") {
      return res
        .status(400)
        .json({ message: "Account status must be a string" });
    }
    const allowedRoles = [
      "user",
      "leader",
      "admin",
      "support",
      "deposit",
      "withdraw",
      "sells",
    ];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role type" });
    }
    const allowedStatus = ["Active", "Inactive", "Disabled"];
    if (!allowedStatus.includes(accountStatus)) {
      return res.status(400).json({ message: "Invalid account status" });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const blockedUsers = [
      "694449c44ac15cc6bdbfad91",
      "6930307ac56b4cc890ab8694",
    ];

    if (blockedUsers.includes(String(id))) {
      return res.status(403).json({
        message: "Access denied. Owner only.",
      });
    }
    user.role = role;
    user.status = accountStatus;
    await user.save();
    return res.status(200).json({
      message: "User updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userPasswordChangeByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!id) {
      return res.status(400).json({
        message: "Unauthorized request",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password is required (min 6 characters)",
      });
    };
      const blockedUsers = [
      "694449c44ac15cc6bdbfad91"
    ];
    if (blockedUsers.includes(String(id))) {
      return res.status(403).json({
        message: "Access denied. Owner only.",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 11);
    if (!hashedPassword) {
      return res.status(400).json({
        message: "Something Wrong",
      });
    }
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password Change Success",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const getMeByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!_id) {
      return res.status(400).json({
        message: "Unauthorized request",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const admin = await User.findById(_id);
    if (!admin) {
      return res.status(400).json({
        message: "Admin Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "You are Admin",
      result: admin,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const allAdminsGetByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!_id) {
      return res.status(400).json({
        message: "Unauthorized request",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const admin = await User.findOne({ _id: _id });
    if (!admin) {
      return res.status(400).json({
        message: "Admin Not Found",
      });
    }
    if (admin.role !== "admin") {
      return res.status(400).json({
        message: "Access denied. Not an admin.",
      });
    }
    const nonUserRoles = await User.find({ role: { $ne: "user" } });
    if (!nonUserRoles || nonUserRoles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No non-user roles found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "All non-user retrieved successfully",
      result: nonUserRoles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error Occurred",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "email & password required",
      });
    }
    if (!typeof password === "string") {
      return res.status(400).json({
        message: "Password must be valid characters",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Enter a valid email",
      });
    }
    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        message: "Admin not found",
      });
    }
    const allowedRoles = [
      "admin",
      "deposit",
      "withdraw",
      "sells",
    ];
    if (!allowedRoles.includes(admin.role)) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }
    if (admin.isVerified === false) {
      return res.status(400).json({
        message: "Your email not verified",
      });
    }
    if (admin.status !== "Active") {
      return res.status(400).json({
        message: "Your account is not activated",
      });
    }
    const matchPassword = await bcrypt.compare(password, admin.password);
    if (!matchPassword) {
      return res.status(400).json({
        message: "Incorrect email or password",
      });
    }
    admin.isLoggedIn = true;
    await admin.save();
    await Session.deleteMany({ userId: admin._id });
    const newSession = new Session({ userId: admin._id });
    await newSession.save();
    const accessToken = await jwt.sign(
      {
        _id: admin._id,
      },
      SECRET,
      { expiresIn: "12h" }
    );
    const refreshToken = await jwt.sign(
      {
        _id: admin._id,
      },
      SECRET,
      { expiresIn: "12h" }
    );
    return res.status(200).json({
      message: "Login Success",
      result: admin,
      accessToken:`Bearer ${accessToken}`,
      refreshToken: `Bearer ${refreshToken}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const adminLogout = async (req, res) => {
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
