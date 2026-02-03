import MobileRecharge from "../models/MobileRecharge.js";
import User from "../models/User.js";
import Price from "../models/Price.js";
import mongoose from "mongoose";
import validate from "../validators/mobileRechargeValidator.js";

export const getMobileRechargeByUser = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid User ID",
            });
        }
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        const recharges = await MobileRecharge.find({ userId: _id }).sort({
            createdAt: -1,
        });
        if (!recharges) {
            return res.status(404).json({
                message: "No mobile recharges found for this user",
            });
        }
        return res.status(200).json({
            message: "Mobile recharges retrieved successfully",
            result: recharges,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    }
};

export const getMobileRechargeByAdmin = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid User ID",
            });
        }
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        if (user.role !== "admin" || user.status !== "Active") {
            return res.status(403).json({
                message: "Access denied. Admins only.",
            });
        }
        const recharges = await MobileRecharge.find().sort({ createdAt: -1 });
        if (!recharges) {
            return res.status(404).json({
                message: "No mobile recharges found",
            });
        }
        return res.status(200).json({
            message: "Mobile recharges retrieved successfully",
            result: recharges,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    }
};

export const mobileRechargeController = async (req, res) => {
    try {
        const { _id } = req.user;
        const { number, operator, amount, walletName } = req.body;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid User ID",
            });
        }
        const validated = validate({ number, operator, amount, walletName });
        if (!validated.isValid) {
            return res.status(400).json(validated.error);
        }
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        };
        if (!user.isLoggedIn) {
            return res.status(403).json({
                message: "Please login to continue",
            });
        };
        if (user.status !== "Active") {
            return res.status(403).json({
                message: "Your account is not active. Please contact support.",
            });
        };
        const amountNum = Number(amount);
        if (!amountNum || amountNum <= 0) {
            return res.status(400).json({
                message: "Invalid recharge amount",
            });
        }
        if (
            !Object.prototype.hasOwnProperty.call(user.toObject(), walletName) ||
            typeof user[walletName] !== "number"
        ) {
            return res.status(400).json({
                message: "Invalid wallet name",
            });
        };
        const minimumRechargeDoc = await Price.findOne({
            priceName: "minimumRecharge",
        });
        if (!minimumRechargeDoc) {
            return res.status(500).json({
                message: "Minimum recharge amount not configured",
            });
        };
        const minimumRechargeAmount = Number(minimumRechargeDoc.amount);
        const walletBalance = Number(user[walletName]);
        if (amountNum < minimumRechargeAmount) {
            return res.status(400).json({
                message: `Minimum recharge amount is ${minimumRechargeAmount}`,
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
        // const rechargeFeeDoc = await Price.findOne({ priceName: "minimumRecharge" });
        // if (!rechargeFeeDoc) {
        //     return res.status(500).json({
        //         message: "Recharge fee not configured",
        //     });
        // };
        const newRecharge = new MobileRecharge({
            userId: _id,
            mobileNumber: number,
            operator,
            amount: amountNum,
            walletName,
        });
        await newRecharge.save();

        // Deduct amount from user's wallet and total balance
        user[walletName] -= amountNum;
        user.balance -= amountNum;
        user.recharges.push(newRecharge._id);
        await user.save();
        return res.status(200).json({
            message: "Mobile recharge successful",
            result: newRecharge,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    };
};

export const approveRechargeByAdmin = async (req, res) => {
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
        message: "Invalid recharge id",
      });
    }
    const recharge = await MobileRecharge.findById(id);
    if (!recharge) {
      return res.status(404).json({
        message: "Recharge not found",
      });
    }
    if (recharge.isVerified) {
      return res.status(400).json({
        message: "Recharge already processed",
      });
    }
    const user = await User.findById(recharge.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const walletName = recharge.walletName;
    if (typeof user[walletName] !== "number") {
      return res.status(400).json({
        message: "Invalid wallet reference",
      });
    }
    if (status === "Processing") {
      recharge.status = status;
      await recharge.save();
    }
    if (status === "Completed") {
      recharge.status = status;
      recharge.isVerified = true;
      await recharge.save();
      user.totalRecharge += recharge.amount;
      await user.save();
    }
    if (status === "Failed") {
      recharge.status = status;
      recharge.isVerified = true;
      await recharge.save();
      user[walletName] += recharge.amount;
      user.balance += recharge.amount;
      await user.save();
    }
    return res.status(200).json({
      message: "Recharge updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error occurred",
    });
  }
};
