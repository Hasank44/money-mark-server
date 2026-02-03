import { Schema, model } from 'mongoose';

const mobileRechargeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    operator: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    walletName: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed'],
        default: 'Pending',
    },
}, {
    timestamps: true,
});

const MobileRecharge = model('MobileRecharge', mobileRechargeSchema);
export default MobileRecharge;