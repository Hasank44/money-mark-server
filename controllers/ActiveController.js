import Active from "../models/Active.js";
import User from "../models/User.js";
import Price from "../models/Price.js";
import activeValidate from "../validators/activeValidator.js";
import mongoose from "mongoose";

export const getAllActiveByAdmin = async (req, res) => {
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
    const histories = await Active.find({}).sort({ createdAt: -1 });
    if (histories.length === 0) {
      return res.status(404).json({
        message: "No History Found",
      });
    }
    return res.status(200).json({
      message: "active histories",
      result: histories,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const userAccountActive = async (req, res) => {
  try {
    const { _id } = req.user;
    const { amount, payWith, paymentAddress, transactionId } = req.body;
    const validate = activeValidate({
      amount,
      payWith,
      paymentAddress,
      transactionId,
    });
    if (!validate.isValid) {
      return res.status(400).json(validate.error);
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number",
      });
    }
    const price = await Price.findOne({ priceName: "accountActive" });
    if (!price) {
      return res.status(400).json({
        message: "Price config not found",
      });
    }
    if (amountNum !== price.amount) {
      return res.status(400).json({
        message: "Wrong Amount",
      });
    }
    const user = await User.findOne({ _id: _id });
    if (!user) {
      return res.status(400).json({
        message: "Account Disabled",
      });
    }
    if (user.isVerified === false) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }
    if (user.isLoggedIn === false) {
      return res.status(400).json({
        message: "Please login first",
      });
    }
    const exist = await Active.findOne({ transactionId });
    if (exist) {
      return res.status(400).json({
        message: "Transaction Already Submitted",
      });
    }
    if (user.accountStatus !== "Inactive") {
      return res.status(400).json({
        message: "Your account is already activated",
      });
    }
    const newActive = new Active({
      userId: user._id,
      amount: amountNum,
      payWith,
      paymentAddress,
      transactionId,
    });
    await newActive.save();
    return res.status(201).json({
      message: "Request Submitted",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const approveAccountActiveByAdmin = async (req, res) => {
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
        message: "Please valid status",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const active = await Active.findById(id);
    if (!active) {
      return res.status(400).json({
        message: "Deposit is not valid",
      });
    }
    if (active.isVerified === true) {
      return res.status(400).json({
        message: "Payment already verified",
      });
    }
    const user = await User.findById(active.userId);
    if (!user) {
      return res.status(400).json({
        message: "Invalid User Payment",
      });
    }
    if (user.accountStatus === "Active") {
      return res.status(400).json({
        message: "user already activated",
      });
    }
    active.status = status;
    active.isVerified = true;
    await active.save();
    if (status === "Completed") {
      const referLabel1Price = await Price.findOne({
        priceName: "referLabel1",
      });
      const referLabel2Price = await Price.findOne({
        priceName: "referLabel2",
      });
      const referLabel3Price = await Price.findOne({
        priceName: "referLabel3",
      });
      user.accountStatus = "Active";
      await user.save();

      const rL1 = referLabel1Price?.amount || 0;
      const rL2 = referLabel2Price?.amount || 0;
      const rL3 = referLabel3Price?.amount || 0;
      const parentUser = await User.findOne({ referCode: user.referredBy });

      if (parentUser) {
        parentUser.balance += rL1;
        parentUser.referEarn += rL1;
        await parentUser.save();

        if (parentUser.referredBy) {
          const grandParentUser = await User.findOne({
            referCode: parentUser.referredBy,
          });
          if (grandParentUser) {
            grandParentUser.balance += rL2;
            grandParentUser.referEarn += rL2;
            await grandParentUser.save();

            if (grandParentUser.referredBy) {
              const greatGrandParentUser = await User.findOne({
                referCode: grandParentUser.referredBy,
              });
              if (greatGrandParentUser) {
                greatGrandParentUser.balance += rL3;
                greatGrandParentUser.referEarn += rL3;
                await greatGrandParentUser.save();
              }
            }
          }
        }
      }
    }
    return res.status(200).json({
      message: "Request updated",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
