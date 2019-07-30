const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const Idea = require('../model/idea').model;
const Comment = require('../model/comment').model;
const paramValidityService = require('../service/paramValidityService');
const ideaService = require('../service/ideaService');
const websocketActions = require("../websocket/websocketEvents");
const notificationService = require('../service/notificationService');
const imageService = require('../service/imageService');
const employeeImgRouter = require('./imageRouter/employeeImgRouter');

/**
 * @api {put} /organisations/:organisationName/employees Update employee details
 * @apiName updateEmployee
 * @apiGroup Organisation/Employees
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} id ObjectId belonging to an employee
 * @apiParam {String} firstName The firstname of the employee
 * @apiParam {String} lastName The lastname of the employee
 * @apiParam {String} position The position of the employee
 * @apiParam {String} image The profile-image of the employee
 *
 * @apiParamExample {json} Request-Example:
 *  {
 *	    "firstName": "Kevin" ,
 *	    "lastName" : "van Schaijk",
 *	    "position": "CEO",
 *	    "image": "34kjhkjhoo-profile.jpg"
 *  }
 *
 * @apiSuccess {String} role Employee role
 * @apiSuccess {String} token Employee token
 * @apiSuccess {String} profileImage Employee profile-image
 * @apiSuccess {String} _id Employee id
 * @apiSuccess {String} firstname Employee firstname
 * @apiSuccess {String} lastName Employee lastName
 * @apiSuccess {String} position Employee position
 * @apiSuccess {String} email Employee email
 * @apiSuccessExample Idea was added:
 *     HTTP/1.1 200 OK
 *  {
 *      "role": "employee",
 *      "token": "123abc",
 *      "profileImage": "34kjhkjhoo-profile.jpg",
 *      "_id": "5ce7dbbfb496b81c8653a2f3",
 *      "firstName": "Kevin",
 *      "lastName": "van Schaijk",
 *      "position": "CEO",
 *      "email": "kevin.van.schaijk01@gmail.com"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse authErr
 * @apiUse serverErr
 */
router.put('/', async (req, res, next) => {
    const { firstName, lastName, position, profilePic } = req.body;
    try {
        paramValidityService.checkBodyParamsValidity([firstName, lastName, position]);

        const employeeInOrgIndex = req.organisation.employees.findIndex(employee => employee.email === req.employee.email);
        const curEmployee = req.organisation.employees[employeeInOrgIndex];

        curEmployee.firstName = firstName;
        curEmployee.lastName = lastName;
        curEmployee.position = position;
        curEmployee.profilePic = profilePic ? profilePic : req.employee.profilePic;

        ideaService.updateAuthorOnIdeas(req.organisation, curEmployee);

        await req.organisation.save();

        websocketActions.broadcast({ type: 'EMPLOYEE_UPDATE' }, req.session.id);
        res.status(200).json({ email: req.employee.email, firstName, lastName, position, profilePic: imageService.convertToImageURL(req.employee.profilePic), sessionUid: req.session.sessionUid, });
    } catch (err) {
        return next(err);
    }
});

/**
 * @api {post} /organisations/:organisationName/employees/ideas Add an idea to the organisation
 * @apiName addIdea
 * @apiGroup Organisation/Employees
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} title Title of the new idea
 * @apiParam {String} description Description of the new idea
 * @apiParamExample {json} Request-Example:
 *      {
 *       "title": "My cool idea",
 *       "description": "Description of my cool idea"
 *     }
 *
 * @apiSuccess {json} idea Newly added idea
 *
 * @apiSuccessExample Idea was added:
 *     HTTP/1.1 201 Created
 *     {
 *              "upvotes": [],
 *              "comments": [],
 *              "_id": "5ce4f995e15e2b0d9dd19a5a",
 *              "author": "5ce4f97ae15e2b0d9dd19a58",
 *              "authorFirstName": "John",
 *              "authorLastName": "Johnson",
 *              "authorPosition": "CEO",
 *              "title": "My cool idea",
 *              "description": "Description of my cool idea"
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse authErr
 * @apiUse serverErr
 */

router.post('/ideas', async (req, res, next) => {
    const { title, description } = req.body;

    try {
        paramValidityService.checkBodyParamsValidity([title, description]);

        req.organisation.ideas.push(new Idea({
            author: req.employee._id,
            authorFirstName: req.employee.firstName,
            authorLastName: req.employee.lastName,
            authorPosition: req.employee.position,
            authorProfPicURL: imageService.convertToImageURL(req.employee.profilePic),
            title,
            description
        }));
        await req.organisation.save();
        const newIdea = req.organisation.ideas[req.organisation.ideas.length - 1];
        // websocketActions.broadcast({ type: 'ADD_IDEA', payload: { ideaId: newIdea._id } }, req.session.id);
        res.status(201).json(newIdea);
        // await notificationService.sendNotification(req.organisation, {
        //     title: `New idea posted in ${req.organisation.organisationName} by ${req.employee.firstName + " " + req.employee.lastName}`,
        //     body: title,
        //     icon: imageService.convertToImageURL(req.organisation.logoImg),
        //     tag: `ADD_IDEA_${req.organisation.organisationName}`,
        //     link: `/${req.organisation.organisationName}/idea/${newIdea._id}`
        // });
    } catch (err) {
        return next(err);
    }
});

router.use('/ideas/:ideaId', ideaService.getIdeaById);

/**
 * @api {post} /organisations/:organisationName/employees/ideas/:ideaId/comments Comment on an idea
 * @apiName addCommentToIdea
 * @apiGroup Organisation/Employees
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} comment The comment that needs to be posted
 * @apiParamExample {json} Request-Example:
 *      {
 *       "comment": "I Like this idea"
 *     }
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {json} idea Modified idea
 *
 * @apiSuccessExample Comment was added:
 *     HTTP/1.1 200 OK
 *     { "message": "Comment registered",
 *       "idea": {
 *              "upvotes": [],
 *              "comments": [],
 *              "_id": "5ce4f995e15e2b0d9dd19a5a",
 *              "author": "5ce4f97ae15e2b0d9dd19a58",
 *              "authorFirstName": "John",
 *              "authorLastName": "Johnson",
 *              "authorPosition": "CEO",
 *              "title": "My cool idea",
 *              "description": "Description of my cool idea"
 *              }
 *     }
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse authErr
 * @apiUse serverErr
 */
router.post('/ideas/:ideaId/comments', async (req, res, next) => {
    try {
        const { comment } = req.body;
        paramValidityService.checkBodyParamsValidity([comment]);

        req.idea.comments.push(new Comment({
            author: req.employee._id,
            authorFirstName: req.employee.firstName,
            authorLastName: req.employee.lastName,
            authorPosition: req.employee.position,
            authorProfPicURL: imageService.convertToImageURL(req.employee.profilePic),
            comment
        }));
        await req.organisation.save();
        // websocketActions.broadcast({ type: 'ADD_COMMENT', payload: { ideaId: req.idea._id } }, req.session.id);
        res.json({ message: 'Comment registered', idea: req.idea });
        // await notificationService.sendNotification(req.organisation, {
        //     title: `New comment posted in ${req.organisation.organisationName} by ${req.employee.firstName + " " + req.employee.lastName}`,
        //     body: comment,
        //     icon: imageService.convertToImageURL(req.organisation.logoImg),
        //     tag: `ADD_COMMENT_${req.organisation.organisationName}`,
        //     link: `/${req.organisation.organisationName}/idea/${req.idea._id}`
        // });
    } catch (err) {
        return next(err);
    }
});

router.use('/profilePic', employeeImgRouter);

module.exports = router;
