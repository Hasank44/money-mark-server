import userRoute from './userRoute.js';
import gmailRoute from './gmailRoute.js'
import adminRoute from './adminRoute.js';
import facebookRoute from './facebookRoute.js';
import instagramRoute from './instagramRoute.js'
import allHistoryRoute from './historyRoute.js'
import giftCodeRoute from './giftCodeRoute.js'
import withdrawRoute from './withdrawRoute.js'

const routes = [
    { path: '/api/v2/admin', handler: adminRoute },
    { path: '/api/v1/user', handler: userRoute },
    { path: '/api/v1/user', handler: gmailRoute },
    { path: '/api/v1/user', handler: facebookRoute },
    { path: '/api/v1/user', handler: instagramRoute },
    { path: '/api/v1/user', handler: allHistoryRoute },
    { path: '/api/v1/user', handler: giftCodeRoute },
    { path: '/api/v1/user', handler: withdrawRoute },
];


const setRoute = (app) => {
    routes.forEach(({ path, handler }) => app.use(path, handler));
};
export default setRoute;