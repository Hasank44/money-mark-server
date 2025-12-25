const validate = (user) => {
    let error = {};

    if (!user.paymentAddress) {
        error.message = 'Enter Your Payment Address';
    } 
    const phoneRegex = /^01[3-9][0-9]{8}$/;
    if (!phoneRegex.test(user.paymentAddress)) {
        error.message = "Invalid Bangladeshi phone number";
    };

    if (!user.payWith) {
        error.message = 'Select Payment method';
    }  else if (typeof user.payWith !== "string") {
        error.message = 'Enter valid payment method'
    }

    if (!user.amount) {
        error.message = 'Enter Your Amount'
    };

    if (!user.transactionId) {
        error.message = 'Enter Your transactionId'
    } else if (typeof user.transactionId !== "string") {
        error.message = 'Enter valid transactionId'
    };

    if (user.payWith === "Bkash" && user.transactionId.length !== 10) {
        error.message = 'Please provide a valid transaction';
    } else if (user.payWith === "Nagad" && user.transactionId.length !== 8) {
        error.message = 'Please provide a valid transaction';
    } else if (user.payWith === "Rocket" && user.transactionId.length < 8 ) {
        error.message = 'Please provide a valid transaction';
    } else if (user.payWith === "Rocket" && user.transactionId.length > 25 ) {
        error.message = 'Please provide a valid transaction';
    };


    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;