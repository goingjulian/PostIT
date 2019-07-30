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
const paramValidityService = require('../../service/paramValidityService.js');
const Employee = require('../../model/employee').model;
const Idea = require('../../model/idea').model;

jest.mock('../../websocket/websocketEvents');
jest.mock('../../service/emailService');

describe('Employee router tests', () => {
    let app, organisation, cookie, testIdea;

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
        
        testIdea = new Idea({
            author: new Employee(testEmployees.regCarl),
            authorFirstName: testEmployees.regCarl.firstName,
            authorLastName: testEmployees.regCarl.lastName,
            authorPosition: testEmployees.regCarl.position,
            title: testIdeas[0].title,
            description: testIdeas[0].description
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

    test('Idea is added when user is logged in (add idea)', async () => {
        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/employees/ideas`)
            .set('Cookie', cookie)
            .send(testIdeas[0]);

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testIdeas[0].title);
        expect(response.body.authorFirstName).toBe(testEmployees.regCarl.firstName);
    });

    test('Error returned when user is not logged in (add idea)', async () => {
        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/employees/ideas`)
            .send(testIdeas[0]);

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Please login to access this resource');
        expect(response.body.type).toBe('Authorization error');
    });

    test('Comment is added when idea exists (add comment)', async () => {
        const comment = "this is a comment";

        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/employees/ideas/${testIdea._id}/comments`)
            .set('Cookie', cookie)
            .send({ comment: comment });

        const refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Comment registered');
        expect(response.body.idea.title).toBe(testIdea.title);
        expect(response.body.idea.comments[0].comment).toBe(comment);
        expect(refreshedOrganisation.ideas[0].comments.length).toBe(1);
        expect(refreshedOrganisation.ideas[0].comments[0].comment).toBe(comment);
    });

    test('Comment is added when idea exists (add comment)', async () => {
        const comment = "this is a comment";

        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/employees/ideas/${testIdea._id}/comments`)
            .set('Cookie', cookie)
            .send({ comment: comment });

        const refreshedOrganisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Comment registered');
        expect(response.body.idea.title).toBe(testIdea.title);
        expect(response.body.idea.comments[0].comment).toBe(comment);
        expect(refreshedOrganisation.ideas[0].comments.length).toBe(1);
        expect(refreshedOrganisation.ideas[0].comments[0].comment).toBe(comment);
    });

    test('Error returned when idea doesn\'t exist (add comment)', async () => {
        const response = await request(app)
            .post(`/organisations/${testOrgs.schiphol.organisationName}/employees/ideas/xxx/comments`)
            .set('Cookie', cookie);

        expect(response.statusCode).toBe(404);
        expect(response.body).toMatchObject({
            type: 'Idea not found',
            message: 'No idea found for the given id'
        });
    });
});
