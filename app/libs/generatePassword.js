const bcrypt = require('bcrypt');
const saltRounds = 10;
const logger = require('./loggerLib');

let hashPassword = (myPlaintextPassword) => {

    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(myPlaintextPassword, salt);
    return hash;
} // end hashPassword

let comparePassword = (oldPassword, hashPassword, cb) => {

    bcrypt.compare(oldPassword, hashPassword, (err, res) => {

        if(err) {

            logger.error(err.message, 'Comparison Error', 5);
            cb(err, null);
        }
        else {

            cb(null, res);
        }
    })
} // end comparePassword

let comparePasswordSync = (myPlaintextPassword, hash) => {

    return bcrypt.compareSync(myPlaintextPassword, hash)
} // end comparePasswordSync

module.exports = {

    hashPassword: hashPassword,
    comparePassword: comparePassword,
    comparePasswordSync: comparePasswordSync
}