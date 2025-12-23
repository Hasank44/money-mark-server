const validate = (user) => {
    let error = {};

    // amount
    if (!user.amount) {
        error.message = 'Enter your amount';
    } else if ( user.payWith === 'mobileBanking' && user.amount < 100) {
        error.message = 'Minimum withdraw 100'
    } else if (user.payWith === 'usdt' && user.amount < 1) {
        error.message = 'Minimum withdraw 1$'
    };

    //method
    if (!user.method) {
        error.message = 'Please select method';
    }  else if (typeof user.method !== "string") {
        error.message = 'Enter valid method'
    }
    //paymentAddress
    if (!user.paymentAddress) {
        error.message = 'Please enter your payment number';
    } else if (user.paymentAddress.length !== 11) {
        error.message = 'Please provide a valid number';
    }  else if (typeof user.paymentAddress !== "string") {
        error.message = 'Enter valid number'
    }

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;