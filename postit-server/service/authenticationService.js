const httpError = require('../errors/httpError');
const regex = require('../helpers/regex');
const crypto = require('crypto');
const roles = require('../helpers/definitions').roles;
const Employee = require('../model/employee').model;
const shortidGenerator = require('shortid');

module.exports.handleRegistration = async (organisation, email, firstName, lastName, position, token, role = roles.employee) => {
  if (!regex.email.test(email)) throw new httpError('Invalid e-mail', 'The provided e-mail address is not valid', 400);
  const domain = email.replace(/.*@/, "");

  if (organisation.allowedMailDomains.length > 0 && !organisation.allowedMailDomains.includes(domain)) throw new httpError('E-mail domain is not allowed', 'The provided e-mail address domain is not allowed within this organisation', 403);

  if (await this.employeeInOrganisation(email, organisation)) throw new httpError('Invalid e-mail', 'The supplied e-mail has already been used within this organisation', 400);

  const employee = await new Employee({ firstName, lastName, role, position, email, token });

  organisation.employees.push(employee);
  await organisation.save();

  return employee;
}

module.exports.getEmployeeFromToken = (organisation, token) => {
  const employee = organisation.employees.find(employee => employee.token === token);
  return employee;
}

module.exports.employeeInOrganisation = (email, organisation) => {
  if (organisation === undefined || organisation.employees === undefined) throw new Error('You must supply a mongoose document as parameter with a property \'employees\' (employeeInOrganisation)');

  const result = organisation.employees.find(employee => employee.email === email);

  if (result) return true;

  return false;
}

module.exports.verifyUserAuthorized = (req, res, next, allowedRoles) => {
  const errMsg = new httpError('Authorization error', 'Please login to access this resource', 401);

  if (req.session.organisations === undefined || req.session.organisations[req.organisation.organisationName] === undefined) return next(errMsg);

  const employee = req.organisation.employees.find(
    employee => employee.email === req.session.organisations[req.organisation.organisationName].email &&
      allowedRoles.includes(employee.role));

  if (employee === undefined) return next(errMsg);

  req.employee = employee;

  next();
  return employee;
}

module.exports.generateToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(128, (err, buf) => {
      if (err) reject(err);
      resolve(buf.toString('hex'));
    });
  });
}

module.exports.setSessionUid = (req, res, next) => {
  try {
    if (!req.session.sessionUid) {
      req.session.sessionUid = shortidGenerator.generate()
    }
    next();
  } catch (e) {
    next(new httpError('Authorization error', 'Session UID could not be set', 500));
  }
}