import { Schema, model } from 'mongoose';

const instagramSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    amount: {
        type: Number
    },
    userName: {
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

const Instagram = model('Instagram', instagramSchema);
export default Instagram;