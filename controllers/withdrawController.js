import mongoose from "mongoose";
import User from "../models/User.js";
import Price from "../models/Price.js";
import Withdraw from "../models/Withdraw.js";
import withdrawValidator from "../validators/withdrawValidator.js";

export const getAllWithdrawByAdmin = async (req, res) => {
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
    const histories = await Withdraw.find({}).sort({ createdAt: -1 });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "deposit histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userWithdrawHistory = async (req, res) => {
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
    const histories = await Withdraw.find({ userId: _id }).sort({
      createdAt: -1,
    });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "withdraw histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userWithdraw = async (req, res) => {
  try {
    const { _id } = req.user;
    const { amount, method, payWith, paymentAddress } = req.body;

    const validate = withdrawValidator({
      amount,
      method,
      payWith,
      paymentAddress,
    });
    if (!validate.isValid) {
      return res.status(400).json(validate.error);
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid User",
      });
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number",
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
    if (user.isVerified === false) {
      return res.status(404).json({
        message: "Please email verify first",
      });
    }
    if (user.status === "Inactive") {
      return res.status(404).json({
        message: "Your account not active",
      });
    }
    if (user.balance < 100) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }
    if (user.balance < amountNum) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }
    const withdrawFeeDoc = await Price.findOne({ priceName: "withdrawFee" });
    if (!withdrawFeeDoc) {
      return res.status(400).json({
        message: "Something wrong"
      });
    }
    const feePercent = Number(withdrawFeeDoc.amount);
    const feeAmount = (amountNum * feePercent) / 100;

    const withdrawAble = amountNum - feeAmount;
    const newWithdraw = new Withdraw({
      userId: user._id,
      amount: amountNum,
      id: user.referCode,
      pay: withdrawAble,
      method,
      payWith,
      paymentAddress,
    });
    await newWithdraw.save();

    user.balance -= newWithdraw.amount;
    user.withdraws.unshift(newWithdraw._id);
    await user.save();
    return res.status(201).json({
      message: "Request Submitted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const approveWithdrawByAdmin = async (req, res) => {
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
        message: "Invalid Credentials",
      });
    }
    const withdraw = await Withdraw.findById(id);
    if (!withdraw) {
      return res.status(400).json({
        message: "Withdraw not exist",
      });
    }
    if (withdraw.isVerified === true) {
      return res.status(400).json({
        message: "Already Submitted",
      });
    }
    const user = await User.findById(withdraw.userId);
    if (!user) {
      return res.status(400).json({
        message: "Account not found!",
      });
    };
    if (status === "Processing") {
      withdraw.status = status;
      await withdraw.save();
    };
    if (status === "Completed") {
      withdraw.status = status;
      withdraw.isVerified = true;
      await withdraw.save();
      user.totalWithdraw += withdraw.amount;
      await user.save();
    };
    if (status === "Failed") {
      withdraw.status = status;
      withdraw.isVerified = true;
      await withdraw.save();
      user.balance += withdraw.amount;
      await user.save();
    }
    return res.status(200).json({
      message: "Withdraw Updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
