import User from "../models/User.js";
import Facebook from "../models/Facebook.js";
import Price from "../models/Price.js";
import mongoose from "mongoose";
import facebookValidator from "../validators/facebookValidator.js";

export const getALLFacebookSellHistory = async (req, res) => {
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
    const histories = await Facebook.find({ }).sort({
      createdAt: -1,
    });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "Facebook sell histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const facebookSellHistory = async (req, res) => {
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
    const histories = await Facebook.find({ userId: _id }).sort({
      createdAt: -1,
    });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "Facebook sell histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userFacebookSell = async (req, res) => {
  try {
    const { _id } = req.user;
    const { gmail, password } =
      req.body;
    const validate = facebookValidator({
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
        message: "Account not active",
      });
    }
    const isExist = await Facebook.findOne({ gmail: gmail });
    if (isExist) {
      return res.status(400).json({
        message: "Facebook already submitted",
      });
    }
    const amount = await Price.findOne({ priceName: "facebookPrice" });
    if (!amount) {
      return res.status(400).json({
        message: "invalid Facebook Price",
      });
    }
    const newFacebook = new Facebook({
      userId: user._id,
      amount: amount.amount,
      gmail,
      password,
    });
    await newFacebook.save();
    user.facebook.push(newFacebook._id);
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

export const approveFacebookByAdmin = async (req, res) => {
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
    if (!typeof status === String) {
      return res.status(400).json({
        message: 'Enter valid status'
      });
    };
    const isExist = await Facebook.findById(id);
    if (!isExist) {
      return res.status(400).json({
        message: "Facebook not exist",
      });
    }
    if (isExist.status === "Completed") {
      return res.status(400).json({
        message: "Facebook already completed",
      });
    }
    if (isExist.isVerified === true) {
      return res.status(400).json({
        message: "Facebook already Verified",
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
      user.facebookEarn += isExist.amount;
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
