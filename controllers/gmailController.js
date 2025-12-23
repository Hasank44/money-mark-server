import User from "../models/User.js";
import Gmail from "../models/Gmail.js";
import Price from "../models/Price.js";
import mongoose from "mongoose";
import gmailValidator from "../validators/gmailValidator.js";

export const getAllGmailSellsByAdmin = async (req, res) => {
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
    const histories = await Gmail.find({ }).sort({ createdAt: -1 });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "Gmail sell histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const gmailSellHistory = async (req, res) => {
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
    const histories = await Gmail.find({ userId: _id }).sort({ createdAt: -1 });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "Gmail sell histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userGmailSell = async (req, res) => {
  try {
    const { _id } = req.user;
    const { gmail, password } = req.body;
    const validate = gmailValidator({
      gmail,
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
    };
    if (user.status === "Inactive") {
      return res.status(404).json({
        message: "Your account not active",
      });
    }
    const isExist = await Gmail.findOne({ gmail: gmail });
    if (isExist) {
      return res.status(400).json({
        message: "Gmail already submitted",
      });
    }
    const amount = await Price.findOne({ priceName: "gmailPrice" });
    if (!amount) {
      return res.status(400).json({
        message: "invalid Gmail Price",
      });
    }
    const newGmail = new Gmail({
      userId: user._id,
      amount: amount.amount,
      gmail,
      password,
    });
    await newGmail.save();
    user.gmail.push(newGmail._id);
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

export const approveGmailByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        message: "Please select status",
      });
    }
    if (!typeof status === String) {
      return res.status(400).json({
        message: 'Select valid status'
      })
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid User",
      });
    }
    const isExist = await Gmail.findById(id);
    if (!isExist) {
      return res.status(400).json({
        message: "Gmail not exist",
      });
    }
    if (isExist.status === "Completed") {
      return res.status(400).json({
        message: "Gmail already completed",
      });
    }
    if (isExist.isVerified === true) {
      return res.status(400).json({
        message: "Gmail already Verified",
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
    };
    if (status === "Failed") {
      isExist.status = status;
      isExist.isVerified = true;
      await isExist.save();
    };
    return res.status(200).json({
      message: "Request Updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
