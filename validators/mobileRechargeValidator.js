
const validate = (user) => {
    let error = {};

    if (!user.number) {
        error.message = 'Mobile number is required';
    } else if (!/^01\d{9}$/.test(user.number)) {
        error.message = 'Invalid mobile number format';
    };

    if (!user.operator) {
        error.message = 'Operator is required';
    } else {
        const validOperators = ['Grameenphone', 'Airtel', 'Banglalink', 'Robi', 'Teletalk'];
        if (!validOperators.includes(user.operator)) {
            error.message = 'Invalid operator selected';
        };
    };
    if (!user.amount) {
        error.message = 'Amount is required';
    } else if (isNaN(user.amount) || user.amount < 20) {
        error.message = 'Amount must be a number and at least 20৳';
    };

    const wallet = ['facebookEarn', 'jobEarn', 'referEarn', 'gmailEarn', 'instagramEarn', 'telegramEarn', 'giftEarn', 'editEarn', 'marketingEarn', 'writingEarn', 'designEarn', 'microJobEarn', 'dataEntryEarn', 'googleJobEarn', 'generalEarn', 'proEarn', 'freeEarn'];
    if (!user.walletName) {
        error.message = 'Please select a wallet';
    } else if (typeof user.walletName !== 'string' || user.walletName.trim() === '') {
        error.message = 'Invalid wallet name';
    } else if (!wallet.includes(user.walletName)) {
        error.message = 'Invalid wallet selected';
    };

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;