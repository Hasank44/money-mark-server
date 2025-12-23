import Price from "../models/Price.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getAllPrices = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "Sorry!",
      });
    }
    const prices = await Price.find({});
    if (!prices) {
      return res.status(404).json({
        message: "Price Not exist",
      });
    }
    return res.status(200).json({
      result: prices,
      message: "Price Retrieved Success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const setPriceByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { priceName, amount } = req.body;
    if (!priceName || !amount) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "Sorry!",
      });
    }
    const price = await Price.findOne({ priceName });
    if (price) {
      return res.status(400).json({
        message: "Already Exist",
      });
    }
    const name = user.userName;
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        message: "Amount must be a valid number",
      });
    }
    const newPrice = new Price({
      setBy: name,
      priceName: priceName,
      amount: amountNum,
    });
    await newPrice.save();
    return res.status(201).json({
      message: "Add success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const priceUpdateByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
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
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "Sorry!",
      });
    }
    const price = await Price.findById(id);
    if (!price) {
      return res.status(400).json({
        message: "Price not exist",
      });
    }
    const updated = await Price.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          setBy: user.userName,
          amount: amountNum,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      result: updated,
      message: "Update Success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
