import { Schema, model } from 'mongoose';

const activeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
    },
    store_amount: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    payWith: {
        type: String,
        default: null
    },
    paymentAddress: {
        type: String,
        default: null
    },
    transactionId: {
        type: String,
        unique: true,
        trim: true,
    },
    status: {
        type: String,
        default: 'Pending'
    },
}, {
    timestamps: true
});

const Active = model('Active', activeSchema);
export default Active;