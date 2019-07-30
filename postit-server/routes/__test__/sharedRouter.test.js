const request = require('supertest');
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);
const session = require('express-session');

const initApp = require('../../app').initApp;
const Organisation = require('../../model/organisation');
const testEmployees = require('../../testHelpers/testEmployees');
const testOrgs = require('../../testHelpers/testOrgs');
const testIdeas = require('../../testHelpers/testIdeas');
const paramValidityService = require('../../service/paramValidityService');
const Employee = require('../../model/employee').model;
const Idea = require('../../model/idea').model;
const Comment = require('../../model/comment').model;

jest.mock('../../websocket/websocketEvents');
jest.mock('../../service/emailService');

describe('Shared router tests', () => {
    let app, organisation, testIdea, comment, cookie;
    const notificationObject = {endpoint: "123", keys:{auth: "123", p256dh: "123"}};

    beforeAll(async () => {
        await mockgoose.prepareStorage();
        await mongoose.connect('mongodb://example.com/test', { useNewUrlParser: true, bufferMaxEntries: 0 });
        const sessionParser = session({ resave: true, saveUninitialized: true, secret: 'testkey' });
        app = initApp(sessionParser);
    });

    afterAll(async () => {
        const { connections } = mongoose;
        const { childProcess } = mockgoose.mongodHelper.mongoBin;
        childProcess.kill();
        await Promise.all(connections.map(c => c.close()));
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await Organisation.deleteMany({});
        await Organisation.insertMany([testOrgs.schiphol, testOrgs.postit]);

        const mockReq = { params: { organisationName: testOrgs.schiphol.organisationName } };
        organisation = await paramValidityService.parseOrganisation(mockReq, undefined, () => { });

        const carlCopy = { ...testEmployees.regCarl };
        const carl = new Employee(carlCopy);
        organisation.employees.push(carl);
        await organisation.save();

        comment = new Comment({ author: carl._id, authorFirstName: carl.firstName, authorLastName: carl.lastName, authorPosition: carl.position, comment: 'This is a comment' });
        testIdea = new Idea({
            author: new Employee(testEmployees.regCarl),
            authorFirstName: testEmployees.regCarl.firstName,
            authorLastName: testEmployees.regCarl.lastName,
            authorPosition: testEmployees.regCarl.position,
            title: testIdeas[0].title,
            description: testIdeas[0].description,
            comments: [comment]
        });
        organisation.ideas.push(testIdea);

        await organisation.save();

        const response1 = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/${testEmployees.regCarl.email}`);

        cookie = response1.header['set-cookie'];

        const updatedOrg = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);
        const token = updatedOrg.employees[0].token;

        await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/verify`)
            .send({ token: token })
            .set('Cookie', cookie);
    });

    test('Idea is returned when it exists (get idea)', async () => {
        const response = await request(app)
            .get(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(testIdea.title);
        expect(response.body.authorFirstName).toBe(testIdea.authorFirstName);
    });

    test('Idea is not returned when it doesn\'t exist (get idea)', async () => {
        const response = await request(app)
            .get(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/xxxx`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            type: 'Idea not found',
            message: 'No idea found for the given id'
        });
    });

    test('Subscription object is successfully added (post subscriptionObject)', async () => {
        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/shared/notifications`)
            .set('Cookie', cookie)
            .send(notificationObject);

        const refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(response.statusCode).toBe(201);
        expect(response.body.excludedOrgNotifications.length).toBe(0);
        expect(refreshedOrganisation.notifications.length).toBe(1);
    });

    test('Error is returned when body is invalid (post subscriptionObject)', async () => {
        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/shared/notifications`)
            .set('Cookie', cookie)
            .send({});

        const refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(response.statusCode).toBe(400);
        expect(response.body).toMatchObject({ type: 'Invalid body', message: 'The body has to contain an object with the keys property' });
        expect(refreshedOrganisation.notifications.length).toBe(0);
    });


    test('Subscription object is successfully removed (delete subscriptionObject)', async () => {
        await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/shared/notifications`)
            .set('Cookie', cookie)
            .send(notificationObject);

        let refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        const response = await request(app)
            .delete(`/organisations/${testOrgs.schiphol.organisationName}/shared/notifications/${refreshedOrganisation.notifications[0].sessionUid}`)
            .set('Cookie', cookie);

        refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(response.statusCode).toBe(200);
        expect(response.body.excludedOrgNotifications).toMatchObject(['schiphol']);
        expect(refreshedOrganisation.notifications.length).toBe(0);
    });

    test('Error is returned when url param sessionUid is invalid (delete subscriptionObject)', async () => {
        const response = await request(app)
            .delete(`/organisations/${testOrgs.schiphol.organisationName}/shared/notifications/123`)
            .set('Cookie', cookie);

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({ type: 'Invalid url param', message: 'No subscription object could be found with the given sessionUid' });
    });

    test('Error returned when user has already upvoted idea (add upvote to idea)', async () => {
        const response1 = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}/upvotes`);

        const cookie = response1.header['set-cookie'];

        expect(response1.statusCode).toBe(200);
        expect(response1.body.idea.title).toBe(testIdea.title);

        const response2 = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}/upvotes`)
            .set('Cookie', cookie);
        
            expect(response2.body).toMatchObject({ type: 'Invalid action', message: 'The current user has already upvoted this idea' });
        expect(response2.statusCode).toBe(403);
    });

    test('Upvote is added when idea exists (add upvote to idea)', async () => {
        const response = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}/upvotes`);

        expect(response.statusCode).toBe(200);
        expect(response.body.idea.authorFirstName).toBe(testIdea.authorFirstName);
        expect(response.body.idea.title).toBe(testIdea.title);
        expect(response.body.idea.upvotes.length).toBe(1);
    });

    test('Error returned when idea doesn\'t exist (add upvote to idea)', async () => {
        const response = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/xxx/upvotes`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            type: 'Idea not found',
            message: 'No idea found for the given id'
        });
    });

    test('Upvote is added on comment when idea and comment exist (add upvote on comment)', async () => {
        expect(organisation.ideas[0].comments[0].upvotes.length).toBe(0);

        const response = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}/comments/${comment._id}/upvotes`);

        const updatedOrg = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Upvote registered');
        expect(response.body.idea.comments[0].title).toBe(organisation.ideas[0].comments[0].title);
        expect(response.body.idea.comments[0].authorFirstName).toBe(organisation.ideas[0].comments[0].authorFirstName);
        expect(response.body.idea.comments[0].upvotes.length).toBe(1);
        expect(updatedOrg.ideas[0].comments[0].upvotes.length).toBe(1);

    });

    test('Error returned user has already upvoted the comment (add upvote on comment)', async () => {
        expect(organisation.ideas[0].comments[0].upvotes.length).toBe(0);
        const response1 = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}/comments/${comment._id}/upvotes`);

        const updatedOrg = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);
        const cookie = response1.header['set-cookie'];

        expect(response1.statusCode).toBe(200);
        expect(response1.body.message).toBe('Upvote registered');
        expect(response1.body.idea.comments[0].upvotes.length).toBe(1);
        expect(updatedOrg.ideas[0].comments[0].upvotes.length).toBe(1);

        const response2 = await request(app)
            .put(`/organisations/${testOrgs.schiphol.organisationName}/shared/ideas/${testIdea._id}/comments/${comment._id}/upvotes`)
            .set('Cookie', cookie);

        expect(response2.statusCode).toBe(403);
        expect(response2.body).toMatchObject({ type: 'Invalid action', message: 'The current user has already upvoted this comment' });

        const refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);
        expect(refreshedOrganisation.ideas[0].comments[0].upvotes.length).toBe(1);
    });
});