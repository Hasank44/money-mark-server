import mongoose from "mongoose";
import TaskAdmin from "../models/TaskAdmin.js";
import TaskJob from "../models/TaskJob.js";
import User from "../models/User.js";
import validate from "../validators/taskAdminValidator.js";
import { getBDTaskDayRange } from "../config/getBDTaskDayRange.js";

export const getAllTaskHistoryByAdmin = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid user"
            });
        };
        const user = await User.findById(_id);
        if (!user) return res.status(404).json({
            message: "User not found"
        });
        if (!user.isLoggedIn)
            return res.status(401).json({
                message: "Please login first"
            });
        if (!user.isVerified)
            return res.status(403).json({
                message: "Please verify email first"
            });
        if (user.status !== "Active")
            return res.status(403).json({
                message: "Account not active"
            });
        const task = await TaskAdmin.find({}).sort({ createdAt: -1 });
        if (!task) return res.status(404).json({
            message: "Task not found"
        });
        return res.status(200).json({
            message: 'Tasks Retrieved success',
            result: task
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    };
};

export const setNewTaskByAdmin = async (req, res) => {
    try {
        const { _id } = req.user;
        const { limit, reward, title, work, link } = req.body;
        const amountNum = Number(reward);
        if (!amountNum || amountNum <= 0) {
            return res.status(400).json({
                message: "Invalid reward amount",
            });
        }
        const amountLimit = Number(limit);
        const valid = validate({
            limit: amountLimit,
            reward: amountNum,
            title,
            work,
            link,
        });
        if (!valid.isValid) {
            return res.status(400).json(valid.error);
        }
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid user",
            });
        }
        const admin = await User.findById(_id);
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
            });
        }
        const newTask = new TaskAdmin({
            setBy: admin.userName,
            limit,
            reward: amountNum,
            title,
            work,
            link,
        });
        await newTask.save();
        return res.status(201).json({
            message: "Task Create success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    }
};

export const taskUpdateByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;
        const { limit, reward, title, work, link } = req.body;
        const amountNum = Number(reward);
        if (!amountNum || amountNum <= 0) {
            return res.status(400).json({
                message: "Invalid reward amount",
            });
        }
        const amountLimit = Number(limit);
        const valid = validate({ limit: amountLimit, reward: amountNum, title, work, link });
        if (!valid.isValid) {
            return res.status(400).json(valid.error);
        }
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid user",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Task",
            });
        }
        const admin = await User.findById(_id);
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
            });
        }
        const task = await TaskAdmin.findById(id);
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
        task.setBy = admin._id;
        task.limit = limit;
        task.reward = amountNum;
        task.title = title;
        task.work = work;
        task.link = link;
        await task.save();
        return res.status(200).json({
            message: "Task Update success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    }
};

export const deleteTaskByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid user",
            });
        }
        const admin = await User.findById(_id);
        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
            });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Task",
            });
        }
        const task = await TaskAdmin.findById(id);
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
            });
        }
        await TaskAdmin.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Task Delete success",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    }
};

export const userStartTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id } = req.user;
        const { note } = req.body;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.isLoggedIn)
            return res.status(401).json({ message: "Please login first" });

        if (!user.isVerified)
            return res.status(403).json({ message: "Please verify email first" });

        if (user.status !== "Active")
            return res.status(403).json({ message: "Account not active" });

        const task = await TaskAdmin.findById(id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        const { startUTC, endUTC } = getBDTaskDayRange();
        const alreadyDoneToday = await TaskJob.findOne({
            userId: _id,
            taskId: id,
            createdAt: { $gte: startUTC, $lt: endUTC, },
        });
        if (alreadyDoneToday) {
            return res.status(429).json({
                message: "You can do this task once per day. Try again after 6 AM (BD Time)"
            });
        };
        // const exists = await TaskJob.findOne({ userId: _id, taskId: id });
        // if (exists) {
        //     return res.status(409).json({
        //         message: "Task already submitted",
        //     });
        // }
        const files = req.uploadedFiles || [];
        const images = files.map(file => ({
            url: file.cloudinary.url,
            public_id: file.cloudinary.public_id,
        }));
        const taskJob = await TaskJob.create({
            userId: _id,
            taskId: id,
            title: task.title,
            images: images,
            description: note || "",
            reward: task.reward,
        });
        user.jobs.push(taskJob._id);
        return res.status(201).json({
            success: true,
            message: "Task submitted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    };
};

export const getAvailableTasksForUser = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const { startUTC, endUTC } = getBDTaskDayRange();
        const completedTasks = await TaskJob.find({
            userId: _id,
            createdAt: {
                $gte: startUTC,
                $lt: endUTC,
            },
        }).select("taskId");
        const completedTaskIds = completedTasks.map(
            (job) => job.taskId
        );
        const tasks = await TaskAdmin.find({
            _id: { $nin: completedTaskIds }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            result: tasks,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error Occurred"
        });
    };
};

export const getUserTaskHistory = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid user"
            });
        }
        const user = await User.findById(_id);
        if (!user) return res.status(404).json({
            message: "User not found"
        });
        if (!user.isLoggedIn)
            return res.status(401).json({
                message: "Please login first"
            });

        if (!user.isVerified)
            return res.status(403).json({
                message: "Please verify email first"
            });

        if (user.status !== "Active")
            return res.status(403).json({
                message: "Account not active"
            });
        const tasks = await TaskJob.find({ userId: _id });
        if (!tasks) {
            return res.status(404).json({
                message: 'No tasks Found'
            });
        };
        return res.status(200).json({
            message: 'Tasks Retrieved Success',
            result: tasks
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server error Occurred"
        });
    };
};

export const userTaskHistoryByAdmin = async (req, res) => {
    try {
        const { _id } = req.user;
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                message: "Invalid User",
            });
        }
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        if (user.isLoggedIn === false) {
            return res.status(404).json({
                message: "Please login first",
            });
        }
        const histories = await TaskJob.find({}).sort({ createdAt: -1 });
        if (histories.length === 0) {
            return res.status(404).json({
                message: "No History Found",
            });
        };
        return res.status(200).json({
            message: "Task Job histories",
            result: histories,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    };
};

export const approveTaskByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({
                message: "Please select status",
            });
        }
        if (!typeof status === String) {
            return res.status(400).json({
                message: 'Select valid status'
            })
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid User",
            });
        }
        const isExist = await TaskJob.findById(id);
        if (!isExist) {
            return res.status(400).json({
                message: "Task not exist",
            });
        }
        if (isExist.status === "Completed") {
            return res.status(400).json({
                message: "Task already completed",
            });
        }
        if (isExist.isVerified === true) {
            return res.status(400).json({
                message: "Task already Verified",
            });
        }
        const user = await User.findById(isExist.userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        if (user.status === "Inactive") {
            return res.status(403).json({
                message: "user account not active",
            });
        }
        if (status === "Processing") {
            isExist.status = status;
            await isExist.save();
        }
        if (status === "Completed") {
            isExist.status = status;
            isExist.isVerified = true;
            await isExist.save();
            user.jobEarn += isExist.reward;
            user.balance += isExist.reward
            await user.save();
        };
        if (status === "Failed") {
            isExist.status = status;
            isExist.isVerified = true;
            await isExist.save();
        };
        return res.status(200).json({
            message: "Request Updated",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Server Error Occurred",
        });
    };
};