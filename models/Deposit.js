import { Schema, model } from "mongoose";

const depositSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
    },
    method: {
      type: String,
      trim: true,
    },
    payWith: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    paymentAddress: {
      type: String,
      trim: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Deposit = model('Deposit', depositSchema);
export default Deposit;