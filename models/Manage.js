import { Schema, model } from 'mongoose';

const manageSchema = new Schema({
    setBy: {
        type: String
    },
    type: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Manage = model('Manage', manageSchema);
export default Manage;