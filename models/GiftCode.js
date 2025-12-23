import { Schema, model } from 'mongoose';

const gitCodeSchema = new Schema({
    userId: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    setBy: {
        type: String
    },
    code: {
        type: String,
        unique: true,
        trim: true
    },
    amount: {
        type: Number
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    usedBy: {
        type: String
    },
    limit: {
        type: Number,
        default: 1
    },
    used: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Giftcode = model('Giftcode', gitCodeSchema);
export default Giftcode;