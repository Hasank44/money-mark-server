import User from '../models/User.js';
import GiftCode from '../models/GiftCode.js';
import mongoose from 'mongoose';
import generateUniqueGiftCode from '../config/generateUniqueGiftCode.js';

export const getAllHistoryByAmin = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const admin = await User.findById(_id);
        if (!admin) {
            return res.status(400).json({
                message: 'Admin not found'
            });
        };
        const histories = await GiftCode.find({}).sort({ createdAt: -1 }).lean();
        if (histories.length === 0) {
            return res.status(400).json({
                message: 'No gift code found'
            });
        };
        return res.status(200).json({
            message: 'Gift code retrieved success',
            result: histories
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const userGetGiftCodeHistory = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: 'Invalid user'
            })
        };
        const histories = await GiftCode.find({ userId: { $in: [_id] } }).sort({ createdAt: -1 });
        if (histories.length === 0) {
            return res.status(200).json({
                message: 'No gift code found'
            });
        };
        return res.status(200).json({
            message: 'Gift code retrieved success',
            result: histories
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const createCodeByAdmin = async (req, res) => {
    try {
        const { _id } = req.user;
        const { amount, usedBy, limit } = req.body;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        const admin = await User.findById(_id);
        if (!admin) {
            return res.status(400).json({
                message: 'Admin not found'
            });
        };
        if (!usedBy || typeof usedBy !== "string") {
            return res.status(400).json({
                message: 'Invalid type formate'
            });
        };
        const amountNum = Number(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({
            message: "Amount must be a valid number",
        });
        };
        if (!amount) {
            return res.status(400).json({
                message: 'Please add amount'
            });
        };
        const amountLimit = Number(limit);
        if (isNaN(amountLimit) || amountLimit <= 0) {
            return res.status(400).json({
            message: "Amount must be a valid number",
        });
        };
        const setCode = await generateUniqueGiftCode();
        const newCode = new GiftCode({
            setBy: admin.userName,
            code: setCode,
            usedBy: usedBy,
            amount: amountNum,
            limit: amountLimit,
        });
        await newCode.save();
        return res.status(201).json({
            result: newCode.code,
            message: 'Add success'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const userGetGiftCode = async (req, res) => {
    try {
        const { _id } = req.user;
        const { code } = req.body;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'Invalid Credentials'
            });
        };
        if (!code || typeof code !== "string") {
            return res.status(400).json({
                message: 'Invalid Gift code'
            });
        };
        if (code.length !== 10) {
            return res.status(400).json({
                message: 'Invalid code'
            });
        };
        const user = await User.findById(_id);
        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        };
        if (user.status !== "Active") {
            return res.status(400).json({
                message: 'Your account not activated'
            });
        };
        const giftCode = await GiftCode.findOne({ code });
        if (!giftCode) {
            return res.status(404).json({
                message: 'Invalid code'
            });
        };
        if (giftCode.limit === giftCode.used) {
            return res.status(400).json({
                message: 'Fully redeemed'
            });
        };
        const isExist = giftCode.userId.includes(_id);
        if (isExist) {
            return res.status(400).json({
                message: 'You already use this code'
            });
        };
        
        const addAmount = giftCode.amount / giftCode.limit;

        giftCode.userId.push(user._id);
        giftCode.used += 1
        giftCode.paidAmount += addAmount
        await giftCode.save();
        user.balance += addAmount;
        user.giftEarn += addAmount;
        user.giftCode.push(giftCode._id);
        await user.save();
        return res.status(200).json({
            message: 'Redeem success'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};