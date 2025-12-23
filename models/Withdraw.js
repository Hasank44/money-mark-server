import { Schema, model } from "mongoose";

const withdrawSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
    },
    id: {
      type: String
    },
    pay: {
      type: Number
    },
    method: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    payWith: {
      type: String,
      trim: true,
    },
    paymentAddress: {
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

const Withdraw = model("Withdraw", withdrawSchema);
export default Withdraw;
