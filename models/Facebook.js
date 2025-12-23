import { Schema, model } from 'mongoose';

const facebookSchema = new Schema({
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

const Facebook = model('Facebook', facebookSchema);
export default Facebook;