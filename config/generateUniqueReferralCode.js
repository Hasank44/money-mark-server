import User from "../models/User.js";

async function generateUniqueReferralCode() {
    let code;
    let exists = true;

    while (exists) {
        code = generateCode();
        exists = await User.findOne({ referralCode: code });
    }

    return code;
}

function generateCode() {
    const chars = "0123456789";
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return code;
}

export default generateUniqueReferralCode;