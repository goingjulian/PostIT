const mongoose = require('mongoose');

const regex = require('../helpers/regex');

const employeeSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['employee', 'admin'],
            default: 'employee',
        },
        position: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            validate: regex.email
        },
        token: {
            type: String,
            required: false,
            default: null
        },
        profilePic: {
            type: String,
            default: null
        }
    },
    { versionKey: false }
);
module.exports = employeeSchema;
module.exports.model = mongoose.model("Employee", employeeSchema);;
