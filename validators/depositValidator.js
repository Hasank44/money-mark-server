
const validate = (user) => {
    
    let error = {};
    
    // amount
    if (!user.amount) {
        error.message = 'Enter your amount';
    } else if ( user.payWith === 'mobileBanking' && user.amount < 100) {
        error.message = 'Minimum deposit 100'
    } else if (user.payWith === 'usdt' && user.amount < 1) {
        error.message = 'Minimum deposit amount 1$'
    };

    //method
    if (!user.method) {
        error.message = 'Please select method';
    }  else if (typeof user.method !== "string") {
        error.message = 'Enter valid valid'
    }
    
    //paymentAddress
    if (!user.paymentAddress) {
        error.message = 'Please enter your pay number';
    } else if (user.paymentAddress.length !== 11) {
        error.message = 'Please provide a valid number';
    } else if (typeof user.paymentAddress !== "string" ) {
        error.message = 'Please provide a valid number';
    };

    // transactionId
    if (!user.transactionId) {
        error.message = 'Please enter your transaction Id'
    } else if (user.method === "bkash" && user.transactionId.length !== 10) {
        error.message = 'Please provide a valid transaction Id';
    } else if (user.method === "nagad" && user.transactionId.length !== 8) {
        error.message = 'Please provide a valid transaction Id';
    } else if (user.method === "rocket" && user.transactionId.length < 8) {
        error.message = 'Please provide a valid transaction Id';
    } else if (user.method === "rocket" && user.transactionId.length > 25) {
        error.message = 'Please provide a valid transaction Id';
    } else if (user.method === "upay" && user.transactionId.length < 8) {
        error.message = 'Please provide a valid transaction Id';
    } else if (user.method === "upay" && user.transactionId.length > 25) {
        error.message = 'Please provide a valid transaction Id';
    };

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};
export default validate;