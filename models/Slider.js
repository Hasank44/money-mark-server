import { Schema, model } from 'mongoose';

const sliderSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    publicId: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

const Slider = model('Slider', sliderSchema);
export default Slider;