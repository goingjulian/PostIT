const express = require('express');
const router = express.Router();

const addOrganisationRouter = require('./addOrganisationRouter');
const authRouter = require('./authRouter');
const adminRouter = require('./adminRouter');
const employeeRouter = require('./employeeRouter');
const sharedRouter = require('./sharedRouter');

const authenticationService = require('../service/authenticationService');
const paramValidityService = require('../service/paramValidityService');
const imageService = require('../service/imageService');
const roles = require('../helpers/definitions').roles;

/**
 * This route is for adding a new organisation. Can be accessed by anyone
 */
router.use('/', addOrganisationRouter);

router.use('/:organisationName', async (req, res, next) => paramValidityService.parseOrganisation(req, res, next));
router.use('/:organisationName', (req, res, next) => authenticationService.setSessionUid(req, res, next));

/**
 * @api {get} /:organisationName/ Get basic info from an organisation
 * @apiDescription Get name, background image, logo and allowed e-mail domains from an organisation
 * @apiName getOrganisation
 * @apiGroup Organisation
 *
 * @apiParam {String} organisationName Organisation name
 *
 * @apiSuccess {String} organisationName Name of the organisation.
 * @apiSuccess {String} backgroundImg URL to background image belonging to the organisation.
 * @apiSuccess {String} logoImg URL to logo image belonging to the organisation.
 * @apiSuccess {[String]} allowedMailDomains E-mail domains that are allowed to login and register with this organisation
 *
 * @apiSuccessExample {json} One or multiple e-mail domains are allowed:
 *     HTTP/1.1 200 OK
 *     {
 *       "organisationName": "My Company",
 *       "backgroundImg": "http://domain.com/img/1234",
 *       "logoImg": "http://domain.com/logo/1234",
 *       "allowedMailDomains": ["gmail.com", "hotmail.com"]
 *     }
 * @apiSuccessExample {json} All e-mail domains are allowed:
 *     HTTP/1.1 200 OK
 *     {
 *       "organisationName": "My Company",
 *       "backgroundImg": "http://domain.com/img/1234",
 *       "logoImg": "http://domain.com/logo/1234",
 *       "allowedMailDomains": []
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 */
router.get('/:organisationName', (req, res) => {
    req.organisation.ideas = [];
    req.organisation.save();
    res.json({
        organisationName: req.organisation.organisationName,
        backgroundImg: imageService.convertToImageURL(req.organisation.backgroundImg),
        logoImg: imageService.convertToImageURL(req.organisation.logoImg),
        allowedMailDomains: req.organisation.allowedMailDomains
    });
});

/**
 * This route is for all authentication related endpoints
 */
router.use('/:organisationName/auth', authRouter);

/**
 * This route is for endpoints that can be accessed by anyone
 */
router.use('/:organisationName/shared', sharedRouter);

/**
 * This route is for endpoints that can be accessed by authenticated employees only
 */
router.use('/:organisationName/employees', (req, res, next) => authenticationService.verifyUserAuthorized(req, res, next, [roles.employee, roles.admin]));
router.use('/:organisationName/employees', employeeRouter);

/**
 * This route is for endpoints that can be accessed by authenticated admins only
 */
router.use('/:organisationName/admin', (req, res, next) => authenticationService.verifyUserAuthorized(req, res, next, [roles.admin]));
router.use('/:organisationName/admin', adminRouter);

module.exports = router;

/**
 * API Doc definitions
 */

/**
 * @apiDefine paramsErr
 *
 * @apiError type The type of error message.
 * @apiError message The error message
 * @apiErrorExample {json} Missing or invalid body parameters
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Missing parameter(s)",
 *       "message": "Please specify all required parameters in the body of your request"
 *     }
 */

/**
* @apiDefine organisationNotFoundErr
*
* @apiError type The type of error message.
* @apiError message The error message
* @apiErrorExample {json} No organisation found for the given name
*     HTTP/1.1 404 Not Found
*     {
*       "type": "Invalid URL",
*       "message": "Organisation not found"
*     }
*/

/**
* @apiDefine emailParseErr
*
* @apiError type The type of error message.
* @apiError message The error message
* @apiErrorExample {json} E-mail address domain is not allowed
*     HTTP/1.1 404 Not Found
*     {
*       "type": "Invalid url",
*       "message": "Employee with email mail@domain.com not found"
*     }
* @apiErrorExample {json} E-mail address is not a valid e-mail address
*     HTTP/1.1 400 Bad Request
*     {
*       "type": "Invalid e-mail",
*       "message": "The provided e-mail address is not valid"
*     }
*/

/**
* @apiDefine serverErr
*
* @apiError type The type of error message.
* @apiError message The error message
* @apiErrorExample {json} Internal server error
*     HTTP/1.1 500 Internal Server Error
*     An error occured on the server while processing your request
*/

/**
 * @apiDefine authErr
 *
 * @apiError type The type of error message.
 * @apiError message The error message
 * @apiErrorExample {json} User is not authorized to acces the resource
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "type": "Authorization error",
 *       "message": "Please login to access this resource"
 *     }
 */