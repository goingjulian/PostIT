const express = require('express');
const router = express.Router();

const httpError = require('../errors/httpError');
const roles = require('../helpers/definitions').roles;
const paramValidityService = require('../service/paramValidityService');
const authenticationService = require('../service/authenticationService');
const imageService = require('../service/imageService');
const emailService = require('../service/emailService');

/**
 * @api {post} /organisations/:organisationName/auth/employees Add an employee to the organisation
 * @apiName addEmployee
 * @apiGroup Organisation/Authentication
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} firstName First name of the employee
 * @apiParam {String} lastName Last name of the employee
 * @apiParam {String} position Position of the employee within the organisation
 * @apiParam {String} email E-mail address of the employee
 * @apiParamExample {json} Request-Example:
 *      {
 *       "email": "mail@domain.com",
 *       "firstName": "John",
 *       "lastName": "Johnson",
 *       "position": "Software Engineer"
 *     }
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *         "message": "Verification e-mail sent to mail@domain.com"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} E-mail address is already used within the organisation
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid e-mail",
 *       "message": "The supplied e-mail has already been used within this organisation"
 *     }
 * @apiErrorExample {json} E-mail address domain is not allowed
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "type": "E-mail is not allowed",
 *       "message": "The provided e-mail address is not allowed"
 *     }
 * @apiErrorExample {json} E-mail address is not a valid e-mail address
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid e-mail",
 *       "message": "The provided e-mail address is not valid"
 *     }
 */

router.post('/employees', async (req, res, next) => {
    const { firstName, lastName, position, email } = req.body;

    try {
        paramValidityService.checkBodyParamsValidity([firstName, lastName, position, email]);

        const token = await authenticationService.generateToken();
        const employee = await authenticationService.handleRegistration(req.organisation, email, firstName, lastName, position, token);

        res.status(201).json({
            message: `Verification e-mail sent to ${employee.email}`
        });

        return await emailService.sendLoginMail(employee.email, req.organisation.organisationName, req.organisation.logoImg, token);
    } catch (err) {
        if (err.status) return next(err);
        throw err;
    }
});

/**
 * @api {get} /organisations/:organisationName/auth/session Restore active session
 * @apiName restoreSession
 * @apiGroup Organisation/Authentication
 *
 * @apiParam {String} organisationName Organisation name
 *
 * @apiSuccess {json} employee Employee object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "_id": "1234abc",
 *         "email": "mail@domain.com",
 *         "firstName": "John",
 *         "lastName": "Johnson",
 *         "position": "CEO",
 *         "sessionUID": "1234a"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse serverErr
 * @apiUse authErr
 *
 * @apiErrorExample {json} Session not found
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "Session not found",
 *       "message": "No active session found for the user"
 *     }
 */
router.get('/session', async (req, res, next) => {
    if (!req.session.excludedOrgNotifications) {
        req.session.excludedOrgNotifications = [];
    }
    try {
        const employee = await authenticationService.verifyUserAuthorized(req, res, () => { }, [roles.employee, roles.admin]);
        if (employee === undefined) throw new httpError('Session not found', 'No active session found for the user', 404);

        return res.json({
            _id: employee._id,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            sessionUid: req.session.sessionUid,
            profilePic: imageService.convertToImageURL(employee.profilePic),
            excludedOrgNotifications: req.session.excludedOrgNotifications
        });
    } catch (err) {
        err.sessionUid = req.session.sessionUid;
        err.excludedOrgNotifications = req.session.excludedOrgNotifications;
        if (err.status) return next(err);
        throw err;
    }
});

/**
 * @api {delete} /organisations/:organisationName/auth/logout Log out an employee
 * @apiName logout
 * @apiGroup Organisation/Authentication
 *
 * @apiParam {String} organisationName Organisation name
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Successfully logged out"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse serverErr
 */
router.delete('/logout', (req, res, next) => {
    try {
        req.session.organisations[req.organisation.organisationName] = undefined;
        res.json({ message: 'Successfully logged out' });
    } catch (err) {
        if (err.status) return next(err);
        throw err;
    }
});

/**
 * @api {put} /organisations/:organisationName/auth/employees/verify Verify e-mail address of employee
 * @apiName verifyEmail
 * @apiGroup Organisation/Authentication
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} token Verification token
 * 
 * @apiParamExample {json} Request-Example:
 *     {
 *       "token": "1234abcdef"
 *     }
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {json} employee Employee object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "User verified successfully",
 *         "_id": "1234abc",
 *         "email": "mail@domain.com",
 *         "firstName": "John",
 *         "lastName": "Johnson",
 *         "position": "CEO",
 *         "sessionUID": "1234a"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} Token is invalid
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid token",
 *       "message": "The token is not valid"
 *     }
 */
router.put('/employees/verify', async (req, res, next) => {
    const { token } = req.body;

    try {
        paramValidityService.checkBodyParamsValidity([token]);

        const employee = await authenticationService.getEmployeeFromToken(req.organisation, token);

        if (employee === undefined) throw new httpError('Invalid token', 'The token is not valid', 400);

        employee.token = null;
        await req.organisation.save();

        if (req.session.organisations === undefined) req.session.organisations = {};
        req.session.organisations[req.organisation.organisationName] = { email: employee.email };

        return res.json({
            message: 'User verified successfully',
            _id: employee._id,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            sessionUid: req.session.sessionUid,
            profilePic: imageService.convertToImageURL(employee.profilePic)
        });
    } catch (err) {
        err.sessionUid = req.session.sessionUid;
        return next(err);
    }
});

/**
 * Middleware - Gets user belonging to the email in the url and binds it to req.employee
 * @param email
 */
router.use('/employees/:email', paramValidityService.parseEmail);

/**
 * @api {get} /organisations/:organisationName/auth/employees/:email Get employee registration status
 * @apiName emailBoundToEmployee
 * @apiGroup Organisation/Authentication
 * @apiDescription Returns true if the email address is already bound to an existing user. Returns false if not.
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} email E-mail address
 *
 * @apiSuccess {Boolean} employeeInOrganisation True if the provided e-mail address is already bound to an existing employee, false if not
 *
 * @apiSuccessExample Employee is in organisation:
 *     HTTP/1.1 200 OK
 *     {
 *         "employeeInOrganisation": true
 *     }
 * @apiSuccessExample Employee is not in organisation:
 *     HTTP/1.1 200 OK
 *     {
 *         "employeeInOrganisation": false
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse serverErr
 * @apiUse emailParseErr
 */
router.get('/employees/:email', async (req, res, next) => {

    try {
        return res.json({ employeeInOrganisation: authenticationService.employeeInOrganisation(req.params.email, req.organisation) });
    } catch (err) {
        return next(err);
    }
});

/**
 * @api {put} /organisations/:organisationName/auth/employees/:email Login an employee
 * @apiName employeeLogin
 * @apiGroup Organisation/Authentication
 * @apiDescription Send verification e-mail if all employee details are right
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} email E-mail address
 *
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "Verification e-mail sent to mail@domain.com"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse serverErr
 * @apiUse emailParseErr
 */
router.put('/employees/:email', async (req, res, next) => {
    try {
        const token = await authenticationService.generateToken();

        req.employee.token = token;
        await req.organisation.save();

        res.json({
            message: `Verification e-mail sent to ${req.employee.email}`
        });
        return await emailService.sendLoginMail(req.employee.email, req.organisation.organisationName, req.organisation.logoImg, token);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
