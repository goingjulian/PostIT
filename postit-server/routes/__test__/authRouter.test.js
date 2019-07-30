const request = require('supertest');
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);
const session = require('express-session');

const initApp = require('../../app').initApp;
const Organisation = require('../../model/organisation');
const testEmployees = require('../../testHelpers/testEmployees');
const testOrgs = require('../../testHelpers/testOrgs');
const paramValidityService = require('../../service/paramValidityService');
const Employee = require('../../model/employee').model;

jest.mock('../../service/emailService');

describe('Authentication router tests', () => {
	let app, organisation;

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
	});

	test('Registration fails if no req body is given (registration)', async () => {
		const response = await request(app).post(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees`);
		expect(response.body).toMatchObject({
			message: 'Please specify all required parameters in the body of your request',
			type: 'Missing parameter(s)'
		});
		expect(response.statusCode).toBe(400);
	});

	test('Registration fails one param is missing from body (registration)', async () => {
		const response = await request(app).post(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees`).send({
			firstName: testEmployees.unregHank.firstName,
			lastName: testEmployees.unregHank.lastName,
			// position: testEmployees.unregHank.position, //this is the missing one
			email: testEmployees.unregHank.email
		});
		expect(response.body).toMatchObject({
			message: 'Please specify all required parameters in the body of your request',
			type: 'Missing parameter(s)'
		});
		expect(response.statusCode).toBe(400);
	});

	test('Registration fails if one param is of wrong type (registration)', async () => {
		const response = await request(app).post(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees`).send({
			firstName: testEmployees.unregHank.firstName,
			lastName: testEmployees.unregHank.lastName,
			position: testEmployees.unregHank.position,
			email: 1234
		});
		expect(response.body).toMatchObject({
			message: 'One or more required parameters is not a string',
			type: 'Invalid parameter(s)'
		});
		expect(response.statusCode).toBe(400);
	});

	test('Registration succeeds if all conditions are met (registration)', async () => {
		const response = await request(app).post(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees`).send(testEmployees.unregHank);
		expect(response.body).toMatchObject({
			message: `Verification e-mail sent to ${testEmployees.unregHank.email}`
		});
		expect(response.statusCode).toBe(201);
		const organisation = await Organisation.findOne({ organisationName: testOrgs.schiphol.organisationName });
		const newEmployee = organisation.employees.find(
			(employee) => employee.email === testEmployees.unregHank.email
		);
		expect(newEmployee).toBeDefined();
	});

	test('Registration fails if email is already in use (registration)', async () => {
		const response = await request(app).post(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees`).send(testEmployees.unregHank);
		expect(response.body).toMatchObject({
			message: `Verification e-mail sent to ${testEmployees.unregHank.email}`
		});
		expect(response.statusCode).toBe(201);

		const response2 = await request(app).post(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees`).send({
			firstName: testEmployees.unregJessica.firstName,
			lastName: testEmployees.unregJessica.lastName,
			position: testEmployees.unregJessica.position,
			email: testEmployees.unregHank.email
		});
		expect(response2.body).toMatchObject({
			type: 'Invalid e-mail',
			message: 'The supplied e-mail has already been used within this organisation'
		});
		expect(response2.statusCode).toBe(400);
	});

	test('Mail sent when details are correct (login)', async () => {
		const response = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/${testEmployees.regCarl.email}`);

		expect(response.body).toMatchObject(
			{
				message: `Verification e-mail sent to ${testEmployees.regCarl.email}`
			}
		);
		expect(response.statusCode).toBe(200);
	});

	test('Error is returned when employee does not exist (login)', async () => {
		const response = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/fake@fake.gg`);

		expect(response.body).toMatchObject({
			type: "Invalid url",
			message: "Employee with email fake@fake.gg not found"
		});
		expect(response.statusCode).toBe(404);
	});

	test('User is verified when all conditions are met (verifyEmail)', async () => {
		const response1 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/${testEmployees.regCarl.email}`);

		expect(response1.body).toMatchObject({ message: `Verification e-mail sent to ${testEmployees.regCarl.email}` });
		expect(response1.statusCode).toBe(200);

		const updatedOrg = await Organisation.findOne({ organisationName: testOrgs.schiphol.organisationName });

		const token = updatedOrg.employees[0].token;

		const response2 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/verify`)
			.send({ token: token });

		expect(response2.body).toMatchObject({ ...testEmployees.regCarl, message: "User verified successfully" });
		expect(response2.statusCode).toBe(200);
	});

	test('Error returned when token is invalid (verifyEmail)', async () => {
		const response2 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/verify`)
			.send({ token: 'faketoken' });

		expect(response2.body).toMatchObject({ message: "The token is not valid", type: "Invalid token" });
		expect(response2.statusCode).toBe(400);
	});

	test('Session is restored when session exists (session)', async () => {
		const response1 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/${testEmployees.regCarl.email}`);

		expect(response1.statusCode).toBe(200);
		expect(response1.body).toMatchObject({ message: `Verification e-mail sent to ${testEmployees.regCarl.email}` });

		const updatedOrg = await Organisation.findOne({ organisationName: testOrgs.schiphol.organisationName });

		const token = updatedOrg.employees[0].token;

		const response2 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/verify`)
			.send({ token: token });

		const cookie = response2.header['set-cookie'];

		expect(response2.body).toMatchObject({ ...testEmployees.regCarl, message: "User verified successfully" });
		expect(response2.statusCode).toBe(200);

		const response3 = await request(app)
			.get(`/organisations/${testOrgs.schiphol.organisationName}/auth/session`)
			.set('Cookie', cookie);

		expect(response3.statusCode).toBe(200);
		expect(response3.body.email).toBe(testEmployees.regCarl.email);
		expect(response3.body.firstName).toBe(testEmployees.regCarl.firstName);
		expect(response3.body.lastName).toBe(testEmployees.regCarl.lastName);
		expect(response3.body.position).toBe(testEmployees.regCarl.position);
	});

	test('Error returned when session doesn\'t exist (session)', async () => {
		const response = await request(app)
			.get(`/organisations/${testOrgs.schiphol.organisationName}/auth/session`);

		expect(response.statusCode).toBe(404);
		expect(response.body).toMatchObject({
			type: 'Session not found',
			message: 'No active session found for the user'
		});
	});

	test('Employee is logged out when session exists (logout)', async () => {
		const response1 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/${testEmployees.regCarl.email}`);

		const cookie = response1.header['set-cookie'];

		expect(response1.statusCode).toBe(200);
		expect(response1.body).toMatchObject({ message: `Verification e-mail sent to ${testEmployees.regCarl.email}` });

		const updatedOrg = await Organisation.findOne({ organisationName: testOrgs.schiphol.organisationName });

		const token = updatedOrg.employees[0].token;

		const response2 = await request(app)
			.put(`/organisations/${testOrgs.schiphol.organisationName}/auth/employees/verify`)
			.send({ token: token })
			.set('Cookie', cookie);

		expect(response2.body).toMatchObject({ ...testEmployees.regCarl, message: "User verified successfully" });
		expect(response2.statusCode).toBe(200);

		const response3 = await request(app)
			.delete(`/organisations/${testOrgs.schiphol.organisationName}/auth/logout`)
			.set('Cookie', cookie);

		expect(response3.statusCode).toBe(200);
		expect(response3.body).toMatchObject({ message: 'Successfully logged out' });

		const response4 = await request(app)
			.get(`/organisations/${testOrgs.schiphol.organisationName}/auth/session`)
			.set('Cookie', cookie);

		expect(response4.statusCode).toBe(404);
		expect(response4.body).toMatchObject({
			type: 'Session not found',
			message: 'No active session found for the user'
		});
	});
});
