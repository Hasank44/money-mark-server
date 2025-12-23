import { Schema, model } from 'mongoose';

const telegramSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number
    },
    number: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String
    },
    userName: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'Pending'
    },

}, {
    timestamps: true
});

const Telegram = model('Telegram', telegramSchema);
export default Telegram;