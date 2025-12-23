import validator from 'validator';

const validate = (user) => {
    let error = {};

    // address
    if (!user.gmail) {
        error.message = 'Enter gmail address';
    } else if (!validator.isEmail(user.gmail)) {
        error.message = 'Provide a valid gmail';
    } else if (typeof user.gmail !== "string") {
        error.message = 'Enter valid gmail'
    } else if ( user.gmail.length > 35) {
        error.message = 'gmail must be at latest under 35 characters'
    }

    // password
    if (!user.password) {
        error.message = 'Enter password'
    }  else if (typeof user.password !== "string") {
        error.message = 'Enter valid transactionId'
    } else if (typeof user.password !== "string") {
        error.message = 'Enter valid password'
    } else if ( user.password.length > 25) {
        error.message = 'password must be at latest under 25 characters'
    }

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;