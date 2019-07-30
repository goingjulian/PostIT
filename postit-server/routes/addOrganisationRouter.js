const express = require('express');
const router = express.Router();

const roles = require('../helpers/definitions').roles;
const paramValidityService = require('../service/paramValidityService');
const organisationService = require('../service/organisationService');
const authenticationService = require('../service/authenticationService');
const emailService = require('../service/emailService');
const httpError = require('../errors/httpError');
const regex = require('../helpers/regex');
const addOrganisationImgRouter = require('./imageRouter/addOrganisationImgRouter');

/**
 * @api {post} /organisations Add a new organisation
 * @apiName addOrganisation
 * @apiGroup Organisation
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} logoImg Image filename + filetype (.png of .jpg) which contains a logo. You can find this name in the response from the image upload endpoint
 * @apiParam {String} backgroundImg Image filename = filetype (.png of .jpg) which contains a background image. You can find this name in the response from the image upload endpoint
 * @apiParam {[String]} allowedMailDomains Array which contains strings with allowed e-mail domain names
 * @apiParam {String} firstName First name of the employee
 * @apiParam {String} lastName Last name of the employee
 * @apiParam {String} position Position of the employee within the organisation
 * @apiParam {String} email E-mail address of the employee
 * @apiParamExample {json} Request-Example:
 *      {
 *       "organisationName": "han",
 *       "logoImg": "IMAGE-1559030888142.jpg",
 *       "backgroundImg": "IMAGE-1559030888142.jpg",
 * 	     "allowedMailDomains": ["gmail.com", "hotmail.com", "yahoo.com"],
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
 *         "message": "Successfully created organisation han. Verification e-mail sent to mail@domain.com"
 *     }
 *
 * @apiUse paramsErr
 * @apiUse serverErr
 * 
 * @apiErrorExample {json} AllowedDomains is not an array
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid parameter",
 *       "message": "AllowedDomains must be of type array"
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
 * @apiErrorExample {json} Organisation name is already taken
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid organisation name",
 *       "message": "There already is an organisation with name han"
 *     }
 * 
 * @apiErrorExample {json} Organisation name contains whitespace
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid organisation name",
 *       "message": "The organisation name must not contain any whitespace"
 *     }
 */
router.post('/', async (req, res, next) => {
    const { organisationName, logoImg, backgroundImg, allowedMailDomains, email, firstName, lastName, position } = req.body;

    try {
        paramValidityService.checkBodyParamsValidity([organisationName, logoImg, backgroundImg, email, firstName, lastName, position]);
        if (!Array.isArray(allowedMailDomains)) throw new httpError('Invalid parameter', 'AllowedDomains must be of type array', 400);
        if (regex.onlyLettersAndNumbers.test(organisationName)) throw new httpError('Invalid organisation name', 'The organisation name must not contain any whitespace or special characters', 400);

        await organisationService.verifyImages(logoImg, backgroundImg);

        const organisation = await organisationService.createOrganisation(organisationName, logoImg, backgroundImg, allowedMailDomains);

        const token = await authenticationService.generateToken();
        const employee = await authenticationService.handleRegistration(organisation, email, firstName, lastName, position, token, roles.admin);

        await organisation.save();

        res.status(201).json({
            message: `Successfully created organisation ${organisationName}. Verification e-mail sent to ${employee.email}`,
            organisationName: organisation.organisationName,
            logoImg: organisation.logoImg,
            backgroundImg: organisation.backgroundImg,
            allowedMailDomains: organisation.allowedMailDomains
        });

        return await emailService.sendLoginMail(employee.email, organisation.organisationName, organisation.logoImg, token);
    } catch (err) {
        return next(err);
    }
});

router.use('/', addOrganisationImgRouter);

module.exports = router;