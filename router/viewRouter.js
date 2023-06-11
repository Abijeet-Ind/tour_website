const express = require('express');
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController');

const router = express.Router();


// router.use(authController.isLoggedIn);
// this route is defined in every single route that is being defined here
// then it will put all the below route in the middleware stack and every route will be runned form this route along with runned route --"IsLoggedIn"-- will also be called

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);

module.exports = router;
    