import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Slider from "../models/Slider.js";

export const createSlider = async (req, res) => {
    try {
        const { title, link } = req.body;
        if (!title || !link) {
            return res.status(400).json({
                message: 'Title or link missing'
            });
        };
        if (!req.file || !req.file.cloudinary) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        };
        const isExist = await Slider.findOne({ title });
        if (isExist) {
            return res.status(400).json({
                message: "Slide already exist"
            });
        };
        const { secure_url, public_id } = req.file.cloudinary;
        const newSlide = new Slider({
            title,
            link,
            image: secure_url,
            publicId: public_id
        });
        await newSlide.save();
        return res.status(200).json({
            message: "uploaded successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const updateSlider = async (req, res) => {
    try {
        const { title, link } = req.body;
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        };
        if (!title || !link) {
            return res.status(400).json({
                message: 'Title or link missing'
            });
        };
        const isExist = await Slider.findById(id);
        if (!isExist) {
            return res.status(400).json({
                message: "Slide not exist"
            });
        };
        let image = isExist.image;
        let imageId = isExist.publicId;
        if (req.file && req.file.cloudinary) {
            if (isExist.publicId) {
                await cloudinary.uploader.destroy(isExist.publicId);
            };
            const { secure_url, public_id } = req.file.cloudinary;
            image = secure_url;
            imageId = public_id;
        };
        isExist.title = title;
        isExist.link = link;
        isExist.image = image;
        isExist.publicId = imageId;
        await isExist.save();

        return res.status(200).json({
            message: 'Slide Update Success'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const deleteSlider = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        };
        const slider = await Slider.findById(id);
        if (!slider) {
            return res.status(400).json({
                message: 'Slider not exist'
            });
        };
        if (slider.publicId) {
            await cloudinary.uploader.destroy(slider.publicId);
        };
        await Slider.findOneAndDelete({ _id: id });
        return res.status(200).json({
            message: 'Slider delete success'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};