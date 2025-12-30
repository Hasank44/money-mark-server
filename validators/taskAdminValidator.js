const validate = (user) => {
    let error = {};

    // limit
    if (typeof user.limit !== 'number') {
        error.message = 'Enter a valid limit';
    };
    // reward
    if (!user.reward) {
        error.message = 'Enter Reward'
    } else if (typeof user.reward !== 'number') {
        error.message = 'Enter a valid Reward';
    };
    // title
    if (!user.title) {
        error.message = 'Please Enter Title'
    } else if (typeof user.title !== 'string') {
        error.message = 'Enter a valid title';
    };
    // work
    if (!user.work) {
        error.message = 'Please Enter Work'
    } else if (typeof user.work !== 'string') {
        error.message = 'Enter a valid work';
    };
    // link
    if (!user.link) {
        error.message = 'Please Enter link'
    } else if (typeof user.link !== 'string') {
        error.message = 'Enter a valid link';
    };

    return {
        error,
        isValid: Object.keys(error).length === 0
    };
};
export default validate;