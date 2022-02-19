const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth');
const { loginValidation, signupValidation } = require('../middleware/validation');
// const signupValidation = require('../middleware/validation').signupCheck();
// const loginValidation = require('../middleware/validation').loginCheck();

//Login
router.get("/login", authController.getLogin);

router.post("/login", loginValidation, authController.postLogin);

//Logout
router.post("/logout", authController.postLogout);

//Signup
router.get('/signup', authController.getSignup);

router.post(
    '/signup', signupValidation, authController.postSignup);

//Reset password
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

//New password
router.get('/reset-password/:token', authController.getNewPassword);

//Update password
router.post('/new-password', authController.postUpdatePassword);

module.exports = router;