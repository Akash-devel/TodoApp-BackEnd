const jwt = require('jsonwebtoken');
const shortid = require('shortid');
const secretKey = 'ProjectStartedWithIndiaBigDemocraticFestival';

let generateToken = (data, cb) => {

    try {
        let claims = {
            jwtid: shortid.generate(),
            iat: Date.now(), // Issued At
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), 
            sub: 'authToken', 
            iss: 'akTodo', 
            data: data
        }
        let tokenDetails = {
            token: jwt.sign(claims, secretKey),
            tokenSecret: secretKey //Don't need to send to user
        } 
        cb(null, tokenDetails) // user details are sent to the user in callback function
    } 
    catch (err) {

        console.log(err)
        cb(err, null)
    }
}
// end generate TOKEN

// Verify Claim
let verifyClaim = (token, secretKey, cb) => {

    // verify a token symmetric
    jwt.verify(token, secretKey, function (err, decoded) {
        if(err) {
            console.log("Error while verify token");
            console.log(err);
            cb(err, null)
        }
        else {
            console.log("--------USER VERIFIED--------");
            console.log(decoded);
            cb(null, decoded);
        }
    });
}
// End Verify Claim

let verifyClaimWithoutSecret = (token, cb) => {

    //verify a symmetric token
    jwt.verify(token, secretKey, function(err, decoded) {

        if(err) {

            console.log("Error while verifying token");
            console.log(err);
            cb(err, data)
        }
        else {

            console.log('------User verified------');
            cb(null, decoded)
        } 

    });
}

module.exports = {
    generateToken: generateToken,
    verifyToken : verifyClaim,
    verifyClaimWithoutSecret: verifyClaimWithoutSecret
}
