import Partner from "../models/Partner.js";
import mongoose from "mongoose";
import User from '../models/User.js';
import partnerValidator from '../validators/partnerValidator.js';

export const getAllPartnerByAdmin = async (req, res) => {
    try {
        const partners = await Partner.find({ });
        if (partners.length <= 0) {
            return res.status(404).json({
                message: 'Partner not found'
            });
        };
        
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
}

export const createPartnerController = async (req, res) => {
    try {
        const { _id } = req.user;
        const { fullName, email, phone, country, address, newAddress } = req.body;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'User not valid'
            });
        };
        const validate = partnerValidator({ fullName, email, phone, country, address, newAddress });
        if (!validate.isValid) {
            return res.status(400).json(validate.error);
        };
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: 'User not exist'
            });
        };
        if (user.status !== "Active") {
            return res.status(404).json({
                message: 'User Not Active'
            });
        };
        const isExist = await Partner.findOne({ userId: _id });
        if (isExist) {
            return res.status(400).json({
                message: 'You are already partner'
            });
        };
        const isEmail = await Partner.findOne({ email });
        if (isEmail) {
            return res.status(404).json({
                message: 'Email already exist'
            });
        };
        await Partner.create({
            userId: user._id,
            fullName,
            email,
            phone,
            country,
            address,
            newAddress: newAddress || ''
        });
       await User.findByIdAndUpdate(user._id, { isPartner: true }, { new: true });
        return res.status(201).json({
            message: 'Apply Successfully'
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};