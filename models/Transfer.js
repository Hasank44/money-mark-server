import { Schema, model } from 'mongoose';

const transferSchema = new Schema({
    userId: {
        type: String,
    },
    senderWallet: {
        type: String,
        trim: true
    },
    receivingWallet: {
        type: String,
        trim: true
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        default: 'Pending'
    }
}, {
    timestamps: true
});

const Transfer = model('Transfer', transferSchema);
export default Transfer;