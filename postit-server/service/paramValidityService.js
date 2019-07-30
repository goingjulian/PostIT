const httpError = require('../errors/httpError');
const Organisation = require('../model/organisation');
const regex = require('../helpers/regex');

module.exports.checkBodyParamsValidity = params => {
    if (typeof params !== 'object') throw new Error('Params must be of type array (paramsValid)');

    for (param of params) {
        if (param === undefined) throw new httpError('Missing parameter(s)', 'Please specify all required parameters in the body of your request', 400);
        if (typeof param !== 'string' || param === '' || regex.emptyString.test(param)) throw new httpError('Invalid parameter(s)', 'One or more required parameters is not a string', 400);
    }
}

module.exports.parseOrganisation = async (req, res, next) => {
    const organisation = await Organisation.findOrganisationByName(req.params.organisationName);

    if (organisation === undefined || organisation === null) return next(new httpError('Invalid url', 'Organisation not found', 404));

    req.organisation = organisation;

    next();
    return organisation;
}

module.exports.parseEmail = async (req, res, next) => {
    if (!regex.email.test(req.params.email)) return next(new httpError('Invalid e-mail', 'The provided e-mail address is of an valid format', 400));

    const employee = req.organisation.employees.find(employee => employee.email === req.params.email);

    if (employee === undefined || employee === null) return next(new httpError('Invalid url', `Employee with email ${req.params.email} not found`, 404));

    req.employee = employee;

    next();
    return employee;
}