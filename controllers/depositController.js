import mongoose from "mongoose";
import User from "../models/User.js";
import Deposit from "../models/Deposit.js";
import depositValidator from "../validators/depositValidator.js";

export const getAllDepositByAdmin = async (req, res) => {
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
    };
    const histories = await Deposit.find({}).sort({ createdAt: -1 });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found"
      });
    }
    return res.status(200).json({
      message: 'deposit histories',
      result: histories
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
}

export const userDepositHistory = async ( req, res ) => {
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
    };
    const histories = await Deposit.find({ userId: _id }).sort({ createdAt: -1 });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found"
      });
    }
    return res.status(200).json({
      message: 'deposit histories',
      result: histories
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userDeposit = async (req, res) => {
  try {
    const { _id } = req.user;
    const { amount, method, payWith, paymentAddress, transactionId } =
      req.body;
    const validate = depositValidator({
      amount,
      method,
      payWith,
      paymentAddress,
      transactionId,
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
      return res.status(404).json({
        message: "Please login first",
      });
    }
    const isExist = await Deposit.findOne({ transactionId });
    if (isExist && isExist.isVerified === true) {
      return res.status(400).json({
        message: "Already completed",
      });
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number",
      });
    }
    const newDeposit = new Deposit({
      userId: user._id,
      amount: amountNum,
      method,
      payWith,
      paymentAddress,
      transactionId,
    });

    await newDeposit.save();
    user.deposits.unshift(newDeposit._id);
    await user.save();

    return res.status(201).json({
      message: "submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
      error: error.message,
    });
  }
};

export const approveDepositByAdmin = async (req, res) => {
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
        message: "Invalid deposit id",
      });
    }
    const deposit = await Deposit.findById(id);
    if (!deposit) {
      return res.status(404).json({
        message: "Deposit not found",
      });
    }
    if (deposit.isVerified === true) {
      return res.status(400).json({
        message: "Payment Already Completed",
      });
    }
    deposit.status = status;
    deposit.isVerified = true;
    await deposit.save();
    if (status === "Completed") {
      if (!mongoose.Types.ObjectId.isValid(deposit.userId)) {
        return res.status(400).json({
          message: "Invalid User ID",
        });
      }
      const user = await User.findById(deposit.userId);
      if (!user) {
        return res.status(404).json({
          message: "Account not found!",
        });
      }
      if (user.isVerified === false) {
      return res.status(404).json({
        message: "User account not verified",
      });
      };
      if (user.status === "Inactive") {
      return res.status(404).json({
        message: "User account not active",
      });
      }
      user.totalDeposit += deposit.amount;
      user.balance += deposit.amount;
      await user.save();
    };
    return res.status(200).json({
      message: "Deposit Updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
      error: error.message,
    });
  }
};
