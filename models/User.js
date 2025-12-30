import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            default: "Jhon Doe",
        },
        userName: {
            type: String,
            trim: true,
            unique: true,
        },
        email: {
            type: String,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
        },
        country: {
            type: String,
        },
        phoneNumber: {
            type: String,
            trim: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            default: "Inactive",
        },
        otp: {
            type: String,
            default: null,
        },
        otpVerified: {
            type: Boolean,
            default: false,
        },
        otpExpire: {
            type: Date,
            default: null,
        },
        role: {
            type: String,
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isLoggedIn: {
            type: Boolean,
            default: false,
        },
        totalDeposit: {
            type: Number,
            default: 0,
        },
        totalWithdraw: {
            type: Number,
            default: 0,
        },
        referCode: {
            type: String,
            trim: true,
        },
        referredBy: {
            type: String,
            trim: true,
        },
        referLink: {
            type: String,
        },
        referLabel1: [
            {
                type: String,
                trim: true,
            },
        ],
        referLabel2: [
            {
                type: String,
                trim: true,
            },
        ],
        referLabel3: [
            {
                type: String,
                trim: true,
            },
        ],
        //earns
        jobEarn: {
            type: Number,
            default: 0,
        },
        referEarn: {
            type: Number,
            default: 0,
        },
        gmailEarn: {
            type: Number,
            default: 0,
        },
        facebookEarn: {
            type: Number,
            default: 0,
        },
        instagramEarn: {
            type: Number,
            default: 0,
        },
        telegramEarn: {
            type: Number,
            default: 0,
        },
        giftEarn: {
            type: Number,
            default: 0,
        },
        editEarn: {
            type: Number,
            default: 0,
        },
        marketingEarn: {
            type: Number,
            default: 0,
        },
        writingEarn: {
            type: Number,
            default: 0,
        },
        designEarn: {
            type: Number,
            default: 0,
        },
        microJobEarn: {
            type: Number,
            default: 0,
        },
        dataEntryEarn: {
            type: Number,
            default: 0,
        },
        googleJobEarn: {
            type: Number,
            default: 0,
        },
        generalEarn: {
            type: Number,
            default: 0,
        },
        proEarn: {
            type: Number,
            default: 0,
        },
        freeEarn: {
            type: Number,
            default: 0,
        },
        totalTransfer: {
            type: Number,
            default: 0,
        },
        totalRecharge: {
            type: Number,
            default: 0,
        },
        // history
        jobs: [
            {
                type: String,
                ref: "TaskJob",
            },
        ],
        deposits: [
            {
                type: String,
                ref: "Deposit",
            },
        ],
        withdraws: [
            {
                type: String,
                ref: "Withdraw",
            },
        ],
        gmail: [
            {
                type: String,
                ref: "Gmail",
            },
        ],
        facebook: [
            {
                type: String,
                ref: "Facebook",
            },
        ],
        instagram: [
            {
                type: String,
                ref: "Instagram",
            },
        ],
        telegram: [
            {
                type: String,
                ref: "Telegram",
            },
        ],
        whatsApp: [
            {
                type: String,
                ref: "Telegram",
            },
        ],
        giftCode: [
            {
                type: String,
                ref: "GiftCode",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const User = model("User", userSchema);
export default User;
