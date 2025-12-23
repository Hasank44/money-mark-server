import validator from 'validator';

const validate = (user) => {
    
    let error = {};

    // userName
    if (!user.userName) {
        error.message = 'Please provide your userName'
    }  else if (typeof user.userName !== "string") {
        error.message = 'Enter valid User name'
    } else if (user.userName.length > 15) {
        error.message = 'UserName must be under 15 characters';
    }

    // email
    if (!user.email) {
        error.message = 'Please provide a email'
    } else if (!validator.isEmail(user.email)) {
        error.message = 'Please provide an valid email';
    }  else if (typeof user.email !== "string") {
        error.message = 'Enter valid Email'
    } else if (user.email.length > 35) {
        error.message = 'Gmail must be under 35 characters';
    };

    // country
    if (!user.country) {
        error.message = 'Please your country code';
    };

    // phoneNumber
    if (!user.phoneNumber) {
        error.message = 'Please provide your phone number';
    } else if (user.phoneNumber.length > 14) {
        error.message = 'Please provide a valid number';
    }  else if (typeof user.phoneNumber !== "string") {
        error.message = 'Enter valid Phone Number'
    }

    // password
    if (!user.password) {
        error.message = 'Please provide a password';
    } else if (user.password.length < 8) {
        error.message = 'password must be at latest 8 characters'
    } else if (user.password.length > 25) {
        error.message = 'password must be under 25 characters'
    }  else if (typeof user.password !== "string") {
        error.message = 'Enter valid password'
    }

    // confirmPassword
    if (!user.confirmPassword) {
        error.message = 'Please Provide confirm password'
    } else if (!user.confirmPassword === user.password) {
        error.message = 'password do not match'
    }

    // refer code
    if (!user.referCode) {
        error.message = 'Please provide invitation code';
    }  else if (typeof user.referCode !== "string") {
        error.message = 'Enter valid Refer code'
    }

    return {
        error,
        isValid: Object.keys(error).length === 0
    };

};

export default validate;