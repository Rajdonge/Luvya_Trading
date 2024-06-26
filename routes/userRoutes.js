const express = require('express');
const { registerUser, loginUser, getUsers, userProfile, updateUserData, changePassword, verifyMail, foget_password, reset_password } = require('../controller/userController');
const { userRegisterValidate, userLoginValidate, changePasswordValidate } = require('../utils/userValidation');
const { ensureAuthenticated } = require('../utils/auth');

const routes = express.Router();

routes.post('/register', userRegisterValidate, registerUser)
routes.post('/login', userLoginValidate, loginUser)
routes.get('/users', ensureAuthenticated, getUsers)
routes.get('/userProfile', ensureAuthenticated, userProfile)
routes.patch('/updateUserData', ensureAuthenticated, updateUserData)
routes.post('/changePassword', ensureAuthenticated, changePasswordValidate, changePassword)
routes.get('/verify', verifyMail)
routes.post('/forget-password', foget_password)
routes.get('/reset-password', reset_password);

module.exports = routes;  