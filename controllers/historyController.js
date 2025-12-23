import mongoose from "mongoose";
import {
  fetchUserHistory,
  paymentHistory,
  sellsHistory,
} from "../service/allHistoryService.js";

export const getAllHistory = async (req, res) => {
  try {
    const history = await fetchUserHistory();
    return res.status(200).json({ history });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const getPayments = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "invalid id",
      });
    }
    const payments = await paymentHistory(_id);
    return res.status(200).json({
      result: payments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const getSells = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "invalid id",
      });
    };
    const sells = await sellsHistory(_id);
    return res.status(200).json({
      result: sells,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  };
};