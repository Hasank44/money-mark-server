import User from '../models/User.js';
import Price from '../models/Price.js';
import Transfer from '../models/Transfer.js';
import mongoose from 'mongoose';

export const userBalanceTransfer = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { senderWallet, receivingWallet, amount } = req.body;

    if (!senderWallet || !receivingWallet) {
      return res.status(400).json({ message: "Select your wallet" });
    }
    if (typeof senderWallet !== "string" || typeof receivingWallet !== "string") {
      return res.status(400).json({
        message: "Wallet must be valid format"
      });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user"
      });
    }
    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        message: "Invalid transfer amount"
      });
    }
    if (senderWallet === receivingWallet) {
      return res.status(400).json({
        message: "Sender and receiver wallet cannot be same",
      });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({
      message: "User not found"
    });
    if (!user.isLoggedIn)
      return res.status(401).json({
        message: "Please login first"
      });
    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify email first"
      });
    if (user.status !== "Active")
      return res.status(403).json({
        message: "Account not active"
      });
    const userObj = user.toObject();

    if (!Object.prototype.hasOwnProperty.call(userObj, senderWallet) ||
        typeof user[senderWallet] !== "number") {
      return res.status(400).json({
        message: "Invalid sender wallet"
      });
    }
    if (!Object.prototype.hasOwnProperty.call(userObj, receivingWallet) ||
        typeof user[receivingWallet] !== "number") {
      return res.status(400).json({
        message: "Invalid receiving wallet"
      });
    }
    const minimumTransferDoc = await Price.findOne({ priceName: "MinimumTransfer" });
    if (!minimumTransferDoc) {
      return res.status(500).json({
        message: "Minimum Transfer amount not configured",
      });
    }
    const minimumTransferAmount = Number(minimumTransferDoc.amount);
    if (amountNum < minimumTransferAmount) {
      return res.status(400).json({
        message: `Minimum transfer amount is ${minimumTransferAmount}`,
      });
    }
    const senderBalance = Number(user[senderWallet]);
    if (senderBalance < amountNum) {
      return res.status(400).json({
        message: "Insufficient wallet balance"
      });
    }
    const transferFeeDoc = await Price.findOne({ priceName: "transferFee" });
    if (!transferFeeDoc) {
      return res.status(500).json({
        message: "Transfer fee not configured",
      });
    }
    const fee = Number(transferFeeDoc.amount);
    const payableAmount = amountNum - fee;

    if (payableAmount <= 0) {
      return res.status(400).json({
        message: "Transfer amount too small after fee",
      });
    }
    const newTransfer = await Transfer.create({
      userId: user._id,
      senderWallet,
      receivingWallet,
      amount: amountNum,
      status: 'Completed'
    });
    user[senderWallet] -= amountNum;
    user[receivingWallet] += payableAmount;
    user.balance = user.balance - amountNum + payableAmount;

    user.totalTransfer += amountNum;
    await user.save();
    return res.status(201).json({
      message: "Balance transferred successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
