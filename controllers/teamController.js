import User from "../models/User.js";

export const getAllReferredUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ referCode: id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    };
    const level1Codes = user.referLabel1 || [];
    const level2Codes = user.referLabel2 || [];
    const level3Codes = user.referLabel3 || [];

    if (
      level1Codes.length === 0 &&
      level2Codes.length === 0 &&
      level3Codes.length === 0
    ) {
      return res.status(200).json({
        success: true,
        result: [],
      });
    }
    const [level1Users, level2Users, level3Users] = await Promise.all([
      User.find({ referCode: { $in: level1Codes } }),
      User.find({ referCode: { $in: level2Codes } }),
      User.find({ referCode: { $in: level3Codes } }),
    ]);
    const calcSellsEarn = u =>
      (u.telegramEarn || 0) +
      (u.gmailEarn || 0) +
      (u.facebookEarn || 0) +
      (u.instagramEarn || 0);
    const level1Data = level1Users.map(u => ({
      fullname: u.fullName,
      userName: u.userName,
      sellsEarn: calcSellsEarn(u),
      status: u.status,
      level: 1,
    }));
    const level2Data = level2Users.map(u => ({
      fullname: u.fullName,
      userName: u.userName,
      sellsEarn: calcSellsEarn(u),
      status: u.status,
      level: 2,
    }));
    const level3Data = level3Users.map(u => ({
      fullname: u.fullName,
      userName: u.userName,
      sellsEarn: calcSellsEarn(u),
      status: u.status,
      level: 3,
    }));
    const referralData = [...level1Data, ...level2Data, ...level3Data].sort(
      (a, b) => b.sellsEarn - a.sellsEarn
    );

    return res.status(200).json({
      success: true,
      result: referralData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
