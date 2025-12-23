import { Schema, model } from 'mongoose';

const priceSchema = new Schema({
    setBy: {
        type: String
    },
    priceName: {
        type: String,
        unique: true,
        trim: true
    },
    amount: {
        type: Number
    },
}, {
    timestamps: true
});

const Price = model('Price', priceSchema);
export default Price;