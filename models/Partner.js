import { Schema, model } from 'mongoose';

const partnerSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    newAddress: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        default: 'pending',
    },
    partnerTasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'PartnerTask',
            default: null
        }
    ]
}, {
    timestamps: true
});

const Partner = model('Partner', partnerSchema);
export default Partner;