import User from "../models/User.js";
import Contact from "../models/Contact.js";
import mongoose from "mongoose";

export const getAllContacts = async (req, res) => {
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
    const contacts = await Contact.find({});
    if (!contacts) {
      return res.status(404).json({
        message: "Contact Not exist",
      });
    }
    return res.status(200).json({
      result: contacts,
      message: "contact Retrieved Success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const setContactByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { title, to } = req.body;
    if (!title || !to) {
      return res.status(400).json({
        message: "All Fields are required",
      });
    }
    if (!typeof title || to === String) {
      return res.status(400).json({
        message: "Invalid Types",
      });
    }
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
    const contact = await Contact.findOne({ title: title });
    if (contact) {
      return res.status(400).json({
        message: "Already Exist",
      });
    }
    const name = user.userName;
    const newContact = new Contact({
      setBy: name,
      title: title,
      to: to,
    });
    await newContact.save();
    return res.status(201).json({
      message: "Add success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};

export const contactUpdateByAdmin = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;
    const { to } = req.body;
    if (!to) {
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
    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(400).json({
        message: "Contact not exist",
      });
    }
    const updated = await Contact.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          setBy: user.userName,
          to: to,
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
    console.log(error);
    return res.status(500).json({
      message: "Server Error Occurred",
    });
  }
};
