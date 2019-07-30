const path = require('path');

const promiseWrappers = require('../helpers/promiseWrappers');
const httpError = require('../errors/httpError');
const Organisation = require('../model/organisation');

module.exports.createOrganisation = async (organisationName, logoImg, backgroundImg, allowedMailDomains) => {
    const organisation = await Organisation.findOrganisationByName(organisationName);

    if (organisation) throw new httpError('Invalid organisation name', `There already is an organisation with name ${organisationName}`, 400);

    const newOrg = new Organisation({ organisationName, logoImg, backgroundImg, allowedMailDomains });

    return newOrg;
}

module.exports.verifyImages = async (...images) => {
    try {
        for (image of images) await promiseWrappers.readFileP(path.join(__dirname + `/../public/uploads/${image}`));
        return true;
    } catch (err) {
        throw new httpError(`Invalid imaage URI('s)`, `One or more of the provided image URI's does not point to an existing image`, 400);
    }
}