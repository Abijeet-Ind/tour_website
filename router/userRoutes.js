const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


router.use(authController.protect);

router.patch('/updatemypassword', authController.updatePassword);
router.patch('/updateMe', userController.insertPhoto, userController.updateMe);
router.delete('/:Id', userController.deleteMe);

router.get('/me',
    authController.protect,
    userController.getMe,
    userController.getUser
);

router.use(authController.notrestrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUser)
  .post(userController.updateUser);

router
  .route('/:Id')
  .get(userController.getAllUser)
  .patch(userController.updateUser);

module.exports = router;
