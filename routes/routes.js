import userRoute from './userRoute.js';
import gmailRoute from './gmailRoute.js'
import adminRoute from './adminRoute.js';
import facebookRoute from './facebookRoute.js';
import instagramRoute from './instagramRoute.js';
import allHistoryRoute from './historyRoute.js';
import giftCodeRoute from './giftCodeRoute.js';
import withdrawRoute from './withdrawRoute.js';
import depositRoute from './depositRoute.js';
import paymentRoute from './paymentRoute.js';
import tasksRoute from './taskJobRoute.js';
import manageRoute from './manageRoute.js';
import mobileRechargeRoute from './mobileRechargeRoute.js';
import partnerRoute from './partnerRoute.js'

const routes = [
    { path: '/api/v2/admin', handler: adminRoute },
    { path: '/api/v1/user', handler: userRoute },
    { path: '/api/v1/user', handler: gmailRoute },
    { path: '/api/v1/user', handler: facebookRoute },
    { path: '/api/v1/user', handler: instagramRoute },
    { path: '/api/v1/user', handler: allHistoryRoute },
    { path: '/api/v1/user', handler: giftCodeRoute },
    { path: '/api/v1/user', handler: withdrawRoute },
    { path: '/api/v1/user', handler: depositRoute },
    { path: '/api/v1/user', handler: tasksRoute },
    { path: '/api/v1/user', handler: mobileRechargeRoute },
    { path: '/api/v1/user', handler: partnerRoute },
    { path: '/api/v3/payment', handler: paymentRoute },
    { path: '/api/v1/manage', handler: manageRoute },
];


const setRoute = (app) => {
    routes.forEach(({ path, handler }) => app.use(path, handler));
};
export default setRoute;