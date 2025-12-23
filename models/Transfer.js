import { Schema, model } from 'mongoose';

const transferSchema = new Schema({
    userId: {
        type: String,
    },
    receiver: {
        type: String,
        trim: true
    },
    amount: {
        type: Number
    },
    note: {
        type: String
    }
}, {
    timestamps: true
});

const Transfer = model('Transfer', transferSchema);
export default Transfer;