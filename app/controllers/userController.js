const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib');
const passwordLib = require('./../libs/generatePassword');
const token = require('./../libs/tokenLib');
const validateInput = require('./../libs/paramsValidationLib');

/* Models */
const UserModel = require('./../models/User');
const AuthModel = require('./../models/Auth');

let signUpFunction = (req, res) => {

    let validateUserInput = () => {

        return new Promise((resolve, reject) => {

            if (req.body.email) {

                if (!validateInput.Email(req.body.email)) {

                    let apiResponse = response.generate(true, 'Email does not meet the requirements', 400, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(req.body.password)) {

                    let apiResponse = response.generate(true, '"Password" parameter is missing', 400, null)
                    reject(apiResponse);
                }
                else {

                    resolve(req)
                }
            }
            else {

                logger.error('Email Field Missing During User Creation', 'userController: createUser()', 5);
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null);
                reject(apiResponse);
            }
        })
    }// end Validate User Input

    let createUser = () => {

        return new Promise((resolve, reject) => {

            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {

                    if (err) {

                        logger.error(err.message, 'userController: createUser', 10);
                        let apiResponse = response.generate(true, 'Failed to Create User', 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(retrievedUserDetails)) {

                        console.log(req.body);

                        let newUser = new UserModel({

                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email.toLowerCase(),
                            countryISDCode: req.body.countryISDCode,
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashPassword(req.body.password),
                            apiKey: req.body.apiKey,
                            createdOn: time.now()
                        })

                        newUser.save((err, newUser) => {

                            if (err) {

                                console.log(err);
                                logger.error(err.message, 'userController: createUser', 10);
                                let apiResponse = response.generate(true, 'Failed to Create new User', 500, null);
                                reject(apiResponse);
                            }
                            else {

                                let newUserObj = newUser.toObject();
                                resolve(newUserObj);
                            }
                        })
                    }
                    else {

                        logger.error('User Cannot Be Created. User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse);
                    }
                })
        })
    } // end Create User

    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {

            delete resolve.password;
            let apiResponse = response.generate(false, 'User created', 200, resolve);
            res.send(apiResponse);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })
} // end start user sign up function

let loginFunction = (req, res) => {

    let findUser = () => {

        console.log("findUser");
        return new Promise((resolve, reject) => {

            if (req.body.email) {

                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ email: req.body.email }, (err, userDetails) => {

                    if (err) {

                        console.log(err);
                        logger.error('Failed to retrieve User Data', 'userController: findUser()', 10);
                        let apiResponse = response.generate(true, 'Failed to Find User Details', 500, null);
                        reject(apiResponse);
                    }
                    else if (check.isEmpty(userDetails)) {

                        logger.error('No User Found', 'userController: findUser()', 7);
                        let apiResponse = response.generate(true, 'No user details found', 404, null);
                        reject(apiResponse);
                    }
                    else {

                        logger.info('User Found', 'userController: findUser()', 10);
                        resolve(userDetails);
                    }
                })
            }
            else {

                let apiResponse = response.generate(true, '"Email" parameter is missing', 400, null);
                reject(apiResponse);
            }
        })
    }// end findUser    

    let validatePassword = (retrievedUserDetails/* This value will get from previous function i.e. findUser */) => {

        console.log("validate Password");
        return new Promise((resolve, reject) => {

            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {

                if (err) {

                    console.log(err);
                    logger.error(err.message, 'userController: validatePassword()', 10);
                    let apiResponse = response.generate(true, 'Login Failed', 500, null);
                    reject(apiResponse);
                }
                else if (isMatch) {

                    let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                    delete retrievedUserDetailsObj.password;
                    delete retrievedUserDetailsObj._id;
                    delete retrievedUserDetailsObj.__v;
                    delete retrievedUserDetailsObj.createdOn;
                    delete retrievedUserDetailsObj.modifiedOn;
                    resolve(retrievedUserDetailsObj);
                }
                else {

                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password.Login Failed', 400, null)
                    reject(apiResponse);
                }
            })
        })
    }// end validatePassword

    let generateToken = (userDetails) => {

        console.log("generate Token");
        return new Promise((resolve, reject) => {

            token.generateToken(userDetails, (err, tokenDetails) => {

                if (err) {

                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                }
                else {

                    tokenDetails.userId = userDetails.userId;
                    tokenDetails.userDetails = userDetails;
                    resolve(tokenDetails);
                }
            })
        })
    } //end generateToken

    let saveToken = (tokenDetails) => {

        console.log("Save token");
        return new Promise((resolve, reject) => {

            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {

                if (err) {

                    console.log(err);
                    logger.error(err.message, 'userController: saveToken', 10);
                    let apiResponse = response.generate(true, 'Failed to generate token', 500, null);
                    reject(apiResponse);
                }
                else if (check.isEmpty(retrievedTokenDetails)) {

                    //If User logged in for the first time
                    let newAuthToken = new AuthModel({

                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })

                    newAuthToken.save((err, newTokenDetails) => {

                        if (err) {

                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed to Generate Token', 500, null)
                            reject(apiResponse)
                        }
                        else {

                            let responseBody = {

                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    })
                }
                else {

                    retrievedTokenDetails.authToken = tokenDetails.token;
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret;
                    retrievedTokenDetails.tokenGenerationTime = time.now();
                    retrievedTokenDetails.save((err, newTokenDetails) => {

                        if (err) {

                            console.log(err);
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed to generate token', 500, null)
                            reject(apiResponse);
                        }
                        else {

                            let responseBody = {

                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    })
                }
            })
        })
    } //end Save Token

    findUser(req, res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {

            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {

            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
} // end of login function

let forgotPwd = (req, res) => {

    "use strict";
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'akashjagatdal@gmail.com', // <gmail id>
            pass: 'technology@11te'  // <gmail pass>
        }
    });

    function generate_random_string(string_length) {
        let random_string = '';
        let random_ascii;
        let ascii_low = 65;
        let ascii_high = 90
        for (let i = 0; i < string_length; i++) {
            random_ascii = Math.floor((Math.random() * (ascii_high - ascii_low)) + ascii_low);
            random_string += String.fromCharCode(random_ascii)
        }
        return random_string
    }

    function generate_random_number() {
        let num_low = 1;
        let num_high = 9;
        return Math.floor((Math.random() * (num_high - num_low)) + num_low);
    }

    function generate() {
        return generate_random_string(3) + generate_random_number();
    }

   const token = generate();

   console.log(generate())

    // const token = "asdfghjk"; // Generate a random token and store it in DB against User
    const mailOptions = {
        from: 'akashjagatdal@gmail.com', // sender address
        to: ['monu.keha1123@gmail.com'], // list of receivers
        subject: 'ToDoApp Password Reset', // Subject line
        html: '<b>Awesome sauce</b>' +
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/change-password/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
    };

    let result = new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                console.log(info);
                resolve(info);
            }
        });
    });

    result.then((resolve) => {

        let apiResponse = response.generate(false, "Password reset link sent", 200, resolve);
        res.send(apiResponse);
    })
     .catch((err) => {
            let apiResponse = response.generate(true, "Error sending password reset link", 404);
            res.send(apiResponse);
        });
} // end forgot password function

module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    forgotPwd: forgotPwd
}