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
    const userId = req.user?._id;
    const { amount, method, payWith, paymentAddress, walletName } = req.body;
    const validate = withdrawValidator({
      amount,
      method,
      payWith,
      paymentAddress,
      walletName,
    });
    if (!validate.isValid) {
      return res.status(400).json(validate.error);
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        message: "Invalid withdraw amount",
      });
    }
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        message: "User not found",
      });
    if (!user.isLoggedIn)
      return res.status(401).json({
        message: "Please login first",
      });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify email first",
      });

    if (user.status !== "Active")
      return res.status(403).json({
        message: "Your Account is not Active",
      });

    if (
      !Object.prototype.hasOwnProperty.call(user.toObject(), walletName) ||
      typeof user[walletName] !== "number"
    ) {
      return res.status(400).json({
        message: "Invalid wallet name",
      });
    }
    const minimumWithdrawDoc = await Price.findOne({
      priceName: "MinimumWithdraw",
    });

    if (!minimumWithdrawDoc) {
      return res.status(500).json({
        message: "Minimum withdraw amount not configured",
      });
    }
    const minimumWithdrawAmount = Number(minimumWithdrawDoc.amount);

    const walletBalance = Number(user[walletName]);
    if (amountNum < minimumWithdrawAmount) {
      return res.status(400).json({
        message: `Minimum withdraw amount is ${minimumWithdrawAmount}`,
      });
    }
    if (walletBalance < amountNum) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }
    if (user.balance < amountNum) {
      return res.status(400).json({
        message: "Insufficient total balance",
      });
    }
    const withdrawFeeDoc = await Price.findOne({ priceName: "withdrawFee" });
    if (!withdrawFeeDoc) {
      return res.status(500).json({
        message: "Withdraw fee not configured",
      });
    }
    const feePercent = Number(withdrawFeeDoc.amount);
    const feeAmount = (amountNum * feePercent) / 100;
    const payableAmount = amountNum - feeAmount;

    const withdraw = await Withdraw.create({
      userId: user._id,
      id: user.referCode,
      amount: amountNum,
      pay: payableAmount,
      method,
      payWith,
      paymentAddress,
      walletName,
    });
    user[walletName] -= amountNum;
    user.balance -= amountNum;

    user.withdraws.unshift(withdraw._id);
    await user.save();

    return res.status(201).json({
      message: "Withdraw request submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error occurred",
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
        message: "Invalid withdraw id",
      });
    }
    const withdraw = await Withdraw.findById(id);
    if (!withdraw) {
      return res.status(404).json({
        message: "Withdraw not found",
      });
    }
    if (withdraw.isVerified) {
      return res.status(400).json({
        message: "Withdraw already processed",
      });
    }
    const user = await User.findById(withdraw.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const walletName = withdraw.walletName;
    if (typeof user[walletName] !== "number") {
      return res.status(400).json({
        message: "Invalid wallet reference",
      });
    }
    if (status === "Processing") {
      withdraw.status = status;
      await withdraw.save();
    }
    if (status === "Completed") {
      withdraw.status = status;
      withdraw.isVerified = true;
      await withdraw.save();
      user.totalWithdraw += withdraw.amount;
      await user.save();
    }
    if (status === "Failed") {
      withdraw.status = status;
      withdraw.isVerified = true;
      await withdraw.save();
      user[walletName] += withdraw.amount;
      user.balance += withdraw.amount;
      await user.save();
    }
    return res.status(200).json({
      message: "Withdraw updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error occurred",
    });
  }
};
