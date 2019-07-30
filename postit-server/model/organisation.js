const mongoose = require('mongoose');

const employee = require('./employee');
const idea = require('./idea');

const organisationSchema = new mongoose.Schema(
    {
        organisationName: {
            type: String,
            required: true
        },
        employees: {
            type: [employee],
            required: true
        },
        ideas: {
            type: [idea],
            required: true
        },
        logoImg: {
            type: String,
            required: true,
            default: 'https://graphicdesignbylisa.com/wp-content/uploads/generic-logo.jpg'
        },
        backgroundImg: {
            type: String,
            required: true,
            default: 'https://images.axios.com/CJf2qJZampIKy-HQ74gmQof4Nsc=/0x565:5088x3427/1920x1080/2018/01/18/1516282958350.jpg'
        },
        allowedMailDomains: {
            type: [String],
            required: true,
            default: []
        },
        notifications: {
            type: [],
            required: true,
            default: []
        }
    },
    { versionKey: false }
);

organisationSchema.statics.findOrganisationByName = function (organisationName) {
    return this.findOne({ organisationName: organisationName });
};

module.exports = mongoose.model("Organisation", organisationSchema);