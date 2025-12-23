import { Schema, model } from 'mongoose';

const activeSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    payWith: {
        type: String,
    },
    paymentAddress: {
        type: String,
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