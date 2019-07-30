const express = require('express');
const router = express.Router();

const httpError = require('../errors/httpError');
const ideaService = require('../service/ideaService');
const websocketActions = require("../websocket/websocketEvents");
const paramValidityService = require('../service/paramValidityService');

/**
 * @api {get} /organisations/:organisationName/shared/ideas Get a list of all ideas within an organisation
 * @apiName getIdeasFromOrganisation
 * @apiGroup Organisation/Shared
 *
 * @apiParam {String} organisationName Organisation name
 *
 * @apiSuccess {json} ideas Array with ideas.
 *
 * @apiSuccessExample {json} Found ideas:
 *     HTTP/1.1 200 OK
 *
 *         [
 *             {
 *                  "upvotes": ["aPj6MWya3"],
 *                  "comments": [],
 *                  "_id": "5ce4f995e15e2b0d9dd19a5a",
 *                  "author": "5ce4f97ae15e2b0d9dd19a58",
 *                  "authorFirstName": "John",
 *                  "authorLastName": "Johnson",
 *                  "authorPosition": "CEO",
 *                  "title": "My idea",
 *                  "description": "A description"
 *              },
 *              {
 *                  "upvotes": [],
 *                  "comments": [],
 *                  "_id": "5ce4f995e15e2b0d9dd19a5a",
 *                  "author": "5ce4f97ae15e2b0d9dd19a58",
 *                  "authorFirstName": "Pete",
 *                  "authorLastName": "Van Dyke",
 *                  "authorPosition": "COO",
 *                  "title": "Another idea",
 *                  "description": "A description"
 *              }
 *         ]
 *
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} No ideas found in organisation
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "No ideas found",
 *       "message": "No ideas were found for the organisation"
 *     }
 */
router.get('/ideas', async (req, res, next) => {
    if (req.organisation.ideas.length < 1) return next(new httpError('No ideas found', 'No ideas were found for the organisation', 404));
    res.status(200).json(req.organisation.ideas);
});

/**
 * @api {post} /organisations/:organisationName/shared/notifications Add a subscriptionObject to the organisation
 * @apiName addNotificationObjectToOrganisation
 * @apiGroup Organisation/Shared
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} endpoint Endpoint for notifications
 * @apiParam {String} expirationTime Length for the object to be valid for
 * @apiParam {Object} keys Keys used for authentication
 *
 * @apiParamExample {json} Request-Example:
 *    {
 *      "endpoint":"https://fcm.googleapis.com/fcm/send/...",
 *      "expirationTime":null,
 *      "keys":{
 *          "p256dh":"...",
 *          "auth":"..."
 *      }
 *   }
 *
 * @apiSuccess {json} excludedOrgNotifications Array with excludedOrgNotifications
 *
 * @apiSuccessExample {json} excludedOrgNotifications:
 *     HTTP/1.1 201 Created
 *     {
 *          excludedOrgNotifications: ["han", "schiphol"]
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} Invalid object in body
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid body",
 *       "message": "The body has to contain an object with the keys property"
 *     }
 */
router.post('/notifications', async (req, res, next) => {
    const { endpoint, keys } = req.body;

    try {
        if (keys === undefined) throw new httpError('Invalid body', 'The body has to contain an object with the keys property', 400);
        paramValidityService.checkBodyParamsValidity([endpoint]);

        if (req.session.excludedOrgNotifications === undefined) {
            req.session.excludedOrgNotifications = [];
        }

        req.organisation.notifications = req.organisation.notifications
            .filter(notification => notification.sessionUid !== req.session.sessionUid);

        if (req.session.excludedOrgNotifications.includes(req.organisation.organisationName)) {
            req.session.excludedOrgNotifications
                .splice(req.session.excludedOrgNotifications
                    .indexOf(req.organisation.organisationName), 1);
        }

        req.body.sessionUid = req.session.sessionUid;
        req.organisation.notifications.push(req.body);
        await req.organisation.save();

        websocketActions.selfBroadcast({type: 'NEW_EXCLUDED_NOTIFICATIONS', payload: {excludedOrgNotifications: req.session.excludedOrgNotifications}},req.session.id);
        res.status(201).json({ excludedOrgNotifications: req.session.excludedOrgNotifications });
    } catch (err) {
        return next(err);
    }
});

/**
 * @api {delete} /organisations/:organisationName/shared/notifications/:sessionUid Delete subscriptionObject by sessionUid
 * @apiName removeNotificationObjectFromOrganisation
 * @apiGroup Organisation/Shared
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} sessionUid Uid to delete the notificationObjects for
 * 
 *
 * @apiSuccess {json} excludedOrgNotifications Array with excludedOrgNotifications
 *
 * @apiSuccessExample {json} excludedOrgNotifications:
 *     HTTP/1.1 200 OK
 *     {
 *          excludedOrgNotifications: ["han", "schiphol"]
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} No subscription object found belonging to id
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "Invalid url param",
 *       "message": "No subscription object could be found with the given sessionUid"
 *     }
 */
router.delete('/notifications/:sessionUid', async (req, res, next) => {
    try {
        const notification = req.organisation.notifications
            .find(notification => notification.sessionUid === req.params.sessionUid);

        if (notification === undefined) throw new httpError('Invalid url param', 'No subscription object could be found with the given sessionUid', 404);

        if (req.session.excludedOrgNotifications === undefined) {
            req.session.excludedOrgNotifications = [];
        }
        if (!req.session.excludedOrgNotifications.includes(req.organisation.organisationName)) {
            req.session.excludedOrgNotifications.push(req.organisation.organisationName);
        }

        req.organisation.notifications = req.organisation.notifications
            .filter(notification => notification.sessionUid !== req.params.sessionUid);

        await req.organisation.save();

        websocketActions.selfBroadcast({type: 'NEW_EXCLUDED_NOTIFICATIONS', payload: {excludedOrgNotifications: req.session.excludedOrgNotifications}},req.session.id);
        res.status(200).json({ excludedOrgNotifications: req.session.excludedOrgNotifications });
    } catch (err) {
        return next(err);
    }
});


router.use('/ideas/:ideaId', ideaService.getIdeaById);

/**
 * @api {get} /organisations/:organisationName/shared/ideas/:ideaId Get one idea
 * @apiName getIdeaFromOrganisation
 * @apiGroup Organisation/Shared
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} ideaId The objectId belonging to an idea
 *
 * @apiSuccess {json} ideas Array with ideas.
 *
 * @apiSuccessExample {json} Idea found:
 *     HTTP/1.1 200 OK
 *
 *          {
 *              "upvotes": ["aPj6MWya3"],
 *              "comments": [],
 *              "_id": "5ce4f995e15e2b0d9dd19a5a",
 *              "author": "5ce4f97ae15e2b0d9dd19a58",
 *              "authorFirstName": "John",
 *              "authorLastName": "Johnson",
 *              "authorPosition": "CEO",
 *              "title": "My idea",
 *              "description": "A description"
 *           }
 *
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} No idea found belonging to id
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "Idea not found",
 *       "message": "No idea found for the given id"
 *     }
 */
router.get('/ideas/:ideaId', async (req, res, next) => {
    res.status(200).json(req.idea);
});

/**
 * @api {post} /organisations/:organisationName/shared/ideas/:ideaId/upvotes Add upvote to an idea
 * @apiName addUpvoteToIdea
 * @apiGroup Organisation/Shared
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} ideaId The objectId belonging to an idea
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {json} idea Updated idea which belongs to the given id
 *
 * @apiSuccessExample {json} Upvote was added:
 *     HTTP/1.1 200 OK
 *     {
 *          "message": "Upvote registered",
 *          "idea": {
 *              "upvotes": ["aPj6MWya3"],
 *              "comments": [],
 *              "_id": "5ce4f995e15e2b0d9dd19a5a",
 *              "author": "5ce4f97ae15e2b0d9dd19a58",
 *              "authorFirstName": "John",
 *              "authorLastName": "Johnson",
 *              "authorPosition": "CEO",
 *              "title": "My idea",
 *              "description": "A description"
 *          }
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} No idea found belonging to id
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "Idea not found",
 *       "message": "No idea found for the given id"
 *     }
 * @apiErrorExample {json} User has already upvoted the idea
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "type": "Invalid action",
 *       "message": "The current user has already upvoted this idea"
 *     }
 */
router.put('/ideas/:ideaId/upvotes', async (req, res, next) => {
    try {
        if (ideaService.employeeAlreadyUpvoted(req.idea.upvotes, req.session.sessionUid)) throw new httpError('Invalid action', 'The current user has already upvoted this idea', 403);

        req.idea.upvotes.push(req.session.sessionUid);
        await req.organisation.save();
        websocketActions.broadcast({ type: 'UPVOTE_IDEA', payload: { ideaId: req.idea._id } }, req.session.id);
        res.json({ message: "Upvote registered", idea: req.idea });
    } catch (err) {
        return next(err);
    }
});

/**
 * @api {put} /organisations/:organisationName/shared/ideas/:ideaId/comments/:commentId/upvotes Add upvote to a comment
 * @apiName addUpvoteToComment
 * @apiGroup Organisation/Shared
 *
 * @apiParam {String} organisationName Organisation name
 * @apiParam {String} ideaId ObjectId belonging to an idea
 * @apiParam {String} commentId ObjectId which belongs to the comment to upvote
 *
 * @apiSuccess {String} message Success message
 * @apiSuccess {String} idea Updated idea which belongs to the given id
 *
 * @apiSuccessExample {json} Upvote was added:
 *     HTTP/1.1 200 OK
 *     {
 *          "message": "Upvote registered",
 *          "idea": {
 *              "upvotes": [],
 *              "comments": [{...comment}],
 *              "_id": "5ce4f995e15e2b0d9dd19a5a",
 *              "author": "5ce4f97ae15e2b0d9dd19a58",
 *              "authorFirstName": "John",
 *              "authorLastName": "Johnson",
 *              "authorPosition": "CEO",
 *              "title": "My idea",
 *              "description": "A description"
 *          }
 *     }
 *
 * @apiUse organisationNotFoundErr
 * @apiUse paramsErr
 * @apiUse serverErr
 *
 * @apiErrorExample {json} No idea found for the given id
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "Idea not found",
 *       "message": "No idea found for the given id"
 *     }
 * @apiErrorExample {json} User has already upvoted the comment
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "type": "Invalid action",
 *       "message": "The current user has already upvoted this comment"
 *     }
 * @apiErrorExample {json} No comment found for the given id
 *     HTTP/1.1 404 Not Found
 *     {
 *       "type": "Comment not found",
 *       "message": "No comment found for the given id"
 *     }
 */
router.put('/ideas/:ideaId/comments/:commentId/upvotes', async (req, res, next) => {
    const commentId = req.params.commentId;

    try {
        const comment = req.idea.comments.find(comment => comment._id.equals(commentId));

        if (comment === undefined) throw new httpError('Comment not found', 'No comment found for the given id', 404);

        if (ideaService.employeeAlreadyUpvoted(comment.upvotes, req.session.sessionUid)) throw new httpError('Invalid action', 'The current user has already upvoted this comment', 403);

        comment.upvotes.push(req.session.sessionUid);
        await req.organisation.save();
        websocketActions.broadcast({ type: 'UPVOTE_COMMENT', payload: { ideaId: req.idea._id } }, req.session.id);
        res.json({ message: "Upvote registered", idea: req.idea });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
