import validator from 'validator';

const validate = (user) => {
    let error = {};

    // name
    if (!user.fullName) {
        error.message = 'Name is required';
    } else if (user.fullName.length > 25){
        error.message = 'Provide name under 25 characters'
    } else if (typeof user.fullName !== 'string') {
        error.message = 'Provide a valid name'
    };

    // email
    if (!user.email) {
        error.message = 'Email is required'
    } else if (!validator.isEmail(user.email)) {
        error.message = 'Provide valid email'
    } else if (typeof user.email !== 'string') {
        error.message = 'Provide a valid email'
    };

    // phone
    if (!user.phone) {
        error.message = 'Phone is required'
    } else if (typeof user.phone !== 'string') {
        error.message = 'Provide a valid phone'
    };

    // country
    if (!user.country) {
        error.message = 'Country is required'
    } else if (typeof user.country !== 'string') {
        error.message = 'Provide a valid country'
    };

    // address
    if (!user.address) {
        error.message = 'Address is required'
    } else if (typeof user.address !== 'string') {
        error.message = 'Provide a valid address'
    };

    // newAddress
    if (user.newAddress && typeof user.newAddress !== 'string') {
        error.message = 'Provide a valid newAddress'
    };

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};

export default validate;