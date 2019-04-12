const express = require('express');
const userController = require('./../controllers/userController');
const appConfig = require('./../../config/appConfig');
const auth = require('./../middlewares/auth');

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // Defining routes
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    app.post(`${baseUrl}/login`, userController.loginFunction);

    app.post(`${baseUrl}/forgotPwd`, userController.forgotPwd);

    app.post(`${baseUrl}/change-password/:tokenId`, userController);
}