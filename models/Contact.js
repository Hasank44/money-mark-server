import { Schema, model } from 'mongoose';

const contactSchema = new Schema({
    setBy: {
        type: String
    },
    title: {
        type: String,
        trim: true,
        unique: true
    },
    to: {
        type: String,
        trim: true
    },
}, {
    timestamps: true
});

const Contact = model('Contact', contactSchema);
export default Contact;