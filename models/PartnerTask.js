import { Schema, model } from 'mongoose';

const partnerTaskSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        default: 'pending'
    }
}, {
    timestamps: true
});

const PartnerTask = model('PartnerTask', partnerTaskSchema);
export default PartnerTask;