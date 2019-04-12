'use strict'
// Defining user Schema
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let userSchema = new Schema({

    userId: {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    countryISDCode: {
        type: String,
        default: ''
    },
    mobileNumber: {
        type: String,
        default: '0'
    },
    password: {
        type: String,
        default: 'jfdnakfnkaeptogpjrgnl'
    },
    apiKey: {
        type: String,
        default: '****AmsbuaehqXa1985vsvabbsalYQVVBIAMNgOInfgINg1s387AsaIAhNSNALNOIQH3NaA****'
    },
    createdOn: {
        type: Date,
        default: ''
    }
})


module.exports = mongoose.model('User', userSchema)