import PartnerTask from "../models/PartnerTask.js";
import User from "../models/User.js";
import Partner from "../models/Partner.js";
import mongoose from "mongoose";

export const getPartnerTasksByAdmin = async (req, res) => {
    try {
        const tasks = await PartnerTask.find({}).lean();
        if (!tasks || tasks.length <= 0) {
            return res.status(200).json({
                message: 'tasks not found'
            });
        };
        return res.status(200).json({
            message: 'Tasks Retrieved Success',
            result: tasks
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Sever Error Occurred'
        });
    };
};

export const getPartnerTaskByUser = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'User Not Exist'
            });
        };
        const tasks = await PartnerTask.find({ userId: _id }).lean();
        if (!tasks || tasks.length <= 0) {
            return res.status(404).json({
                message: 'Task not found'
            });
        };
        return res.status(200).json({
            message: 'Tasks retrieved success',
            result: tasks
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const createPartnerTask = async (req, res) => {
    try {
        const { _id } = req.user;
        const { title, link } = req.body;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'User Not Exist'
            });
        };
        if (!title || !link) {
            return res.status(400).json({
                message: 'Title or link is required'
            });
        };
        const user = await User.findById(_id).lean();
        if (!user) {
            return res.status(404).json({
                message: 'User not exist'
            });
        };
        if (user.status !== "Active") {
            return res.status(400).json({
                message: 'User Not Active'
            });
        };
        const isPartner = await Partner.findOne({ userId: user._id }).lean();
        if (!isPartner) {
            return res.status(403).json({
                message: 'You must apply as a partner first'
            });
        };
        const newTask = new PartnerTask({
            userId: user._id,
            title,
            link
        });
        await newTask.save();
        return res.status(201).json({
            message: 'Upload Success'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};

export const approvePartnerTaskByAdmin = async (req, res) => {
    try {
        const { _id } = req.user;
        const { taskId } = req.params;
        const { status } = req.body;
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: 'User Not Exist'
            });
        };
        if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({
                message: 'Task Not Exist'
            });
        };
        if (!status || typeof status !== 'string') {
            return res.status(400).json({
                message: 'status is required or invalid'
            });
        };
        const task = await PartnerTask.findById(taskId).lean();
        if (!task) {
            return res.status(400).json({
                message: 'Invalid Task or not submitted'
            });
        };
        task.status = status;
        await task.save();
        return res.status(200).json({
            message: `Task ${status} Success`
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server Error Occurred'
        });
    };
};