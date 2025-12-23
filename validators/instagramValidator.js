const validate = (user) => {
    let error = {};

    // address
    if (!user.userName) {
        error.message = 'Enter instagram user name';
    } else if ( user.userName.length > 40) {
        error.message = 'userName must be at latest under 40 characters'
    }

    // password
    if (!user.password) {
        error.message = 'Enter password'
    }  else if (typeof user.password !== "string") {
        error.message = 'Enter valid Password'
    } else if ( user.password.length > 25) {
        error.message = 'gmail must be at latest under 25 characters'
    }

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;