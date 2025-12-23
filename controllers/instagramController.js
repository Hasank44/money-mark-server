import User from "../models/User.js";
import Instagram from "../models/Instagram.js";
import Price from "../models/Price.js";
import mongoose from "mongoose";
import instagramValidator from "../validators/instagramValidator.js";

export const getAllInstagramSellHistory = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid User",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.isLoggedIn === false) {
      return res.status(404).json({
        message: "Please login first",
      });
    }
    const histories = await Instagram.find({}).sort({
      createdAt: -1,
    });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "Instagram sell histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const instagramSellHistory = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid User",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.isLoggedIn === false) {
      return res.status(404).json({
        message: "Please login first",
      });
    }
    const histories = await Instagram.find({ userId: _id }).sort({
      createdAt: -1,
    });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "Instagram sell histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userInstagramSell = async (req, res) => {
  try {
    const { _id } = req.user;
    const { userName, password } = req.body;
    const validate = instagramValidator({
      userName,
      password,
    });
    if (!validate.isValid) {
      return res.status(400).json(validate.error);
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid User",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.isLoggedIn === false) {
      return res.status(403).json({
        message: "Please login first",
      });
    }
    if (user.isVerified === false) {
      return res.status(404).json({
        message: "Please email verify first",
      });
    }
    if (user.status === "Inactive") {
      return res.status(404).json({
        message: "your account not active",
      });
    }
    const isExist = await Instagram.findOne({ userName: userName });
    if (isExist) {
      return res.status(400).json({
        message: "Instagram already submitted",
      });
    }
    const amount = await Price.findOne({ priceName: "instagramPrice" });
    if (!amount) {
      return res.status(400).json({
        message: "invalid Instagram Price",
      });
    }
    const newInstagram = new Instagram({
      userId: user._id,
      amount: amount.amount,
      userName,
      password
    });
    await newInstagram.save();
    user.instagram.push(newInstagram._id);
    await user.save();
    return res.status(201).json({
      message: "Submitted Success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const approveInstagramByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        message: "Please select status",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid User",
      });
    }
    const isExist = await Instagram.findById(id);
    if (!isExist) {
      return res.status(400).json({
        message: "Instagram not exist",
      });
    }
    if (isExist.status === "Completed") {
      return res.status(400).json({
        message: "Instagram already completed",
      });
    }
    if (isExist.isVerified === true) {
      return res.status(400).json({
        message: "Instagram already Verified",
      });
    }
    const user = await User.findById(isExist.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    if (user.status === "Inactive") {
      return res.status(403).json({
        message: "user account not active",
      });
    }
    if (status === "Processing") {
      isExist.status = status;
      await isExist.save();
    }
    if (status === "Completed") {
      isExist.status = status;
      isExist.isVerified = true;
      await isExist.save();
      user.balance += isExist.amount;
      await user.save();
    }
    if (status === "Failed") {
      isExist.status = status;
      isExist.isVerified = true;
      await isExist.save();
    }
    return res.status(200).json({
      message: "Request Updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
