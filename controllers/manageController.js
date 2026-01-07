import Manage from '../models/Manage.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getAllManage = async (req, res) => {
  try {
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "Sorry!",
      });
    }
    const manages = await Manage.find({});
    if (!manages) {
      return res.status(404).json({
        message: "manage Not exist",
      });
    }
    return res.status(200).json({
      result: manages,
      message: "manage Retrieved Success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const setManageByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { type, title, description } = req.body;
    if (!title || !type || !description) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    };
    if (typeof title !== 'string' || typeof type !== 'string') {
      return res.status(400).json({
        message: "Invalid Types",
      });
    };
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    };
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "Sorry!",
      });
    };
    const contact = await Manage.findOne({ type: type });
    if (contact) {
      return res.status(400).json({
        message: "Already Exist",
      });
    };
    const name = user.userName;
    const newContact = new Manage({
      setBy: name,
      title: title,
      type: type,
      description: description
    });
    await newContact.save();
    return res.status(201).json({
      message: "Add success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  };
};

export const manageUpdateByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
    const user = await User.findById(_id);
    if (!user) {
      return res.status(400).json({
        message: "Sorry!",
      });
    }
    const manage = await Manage.findById(id);
    if (!manage) {
      return res.status(400).json({
        message: "Update not exist",
      });
    }
    const updated = await Manage.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          setBy: user.userName,
          title: title,
          description: description
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      result: updated,
      message: "Update Success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};