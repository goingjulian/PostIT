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

const newOrg = {
    organisationName: 'myneworg',
    logoImg: 'testimg.gif',
    backgroundImg: 'testimg.gif',
    allowedMailDomains: ['domain1.com', 'domain2.com'],
    email: 'testmail@domain1.com',
    firstName: 'John',
    lastName: 'Hankson',
    position: 'CEO'
}

describe('Add organisation router tests', () => {
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

    test('Add org succeeds if all criteria are met (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send(newOrg);
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe(`Successfully created organisation ${newOrg.organisationName}. Verification e-mail sent to ${newOrg.email}`);
        expect(response.body.organisationName).toBe(newOrg.organisationName);
        expect(response.body.logoImg).toBe(newOrg.logoImg);
        expect(response.body.backgroundImg).toBe(newOrg.backgroundImg);
    });

    test('Add org fails if allowedMailDomains is not an array (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send({ ...newOrg, allowedMailDomains: "notanarray" });

        expect(response.body).toMatchObject({
            message: `AllowedDomains must be of type array`,
            type: `Invalid parameter`
        });
        expect(response.statusCode).toBe(400);
    });

    test('Add org fails if organisation name is taken (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send({ ...newOrg, organisationName: testOrgs.schiphol.organisationName });

        expect(response.body).toMatchObject({
            message: `There already is an organisation with name ${testOrgs.schiphol.organisationName}`,
            type: `Invalid organisation name`
        });
        expect(response.statusCode).toBe(400);
    });

    test('Add org fails if e-mail address is invalid (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send({ ...newOrg, email: 'fake' });

        expect(response.body).toMatchObject({
            message: `The provided e-mail address is not valid`,
            type: `Invalid e-mail`
        });
        expect(response.statusCode).toBe(400);
    });

    test('Add org fails if e-mail address has not allowed domain (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send({ ...newOrg, email: 'test@notalloweddomain.com' });

        expect(response.body).toMatchObject({
            message: `The provided e-mail address domain is not allowed within this organisation`,
            type: `E-mail domain is not allowed`
        });
        expect(response.statusCode).toBe(403);
    });

    test('Add org fails if organisation name contains whitespace (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send({ ...newOrg, organisationName: 'my org' });

        expect(response.body).toMatchObject({
            message: `The organisation name must not contain any whitespace or special characters`,
            type: `Invalid organisation name`
        });
        expect(response.statusCode).toBe(400);
    });

    test('Add org fails if organisation name contains special characters (add organisation)', async () => {
        const response = await request(app).post(`/organisations`)
            .send({ ...newOrg, organisationName: '$organisation.' });

        expect(response.body).toMatchObject({
            message: `The organisation name must not contain any whitespace or special characters`,
            type: `Invalid organisation name`
        });
        expect(response.statusCode).toBe(400);
    });
});
