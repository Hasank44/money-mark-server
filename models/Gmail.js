import { Schema, model } from 'mongoose';

const gmailSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number
    },
    gmail: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true,
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

const Gmail = model('Gmail', gmailSchema);
export default Gmail;