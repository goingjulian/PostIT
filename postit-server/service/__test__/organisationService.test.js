const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const organisationService = require('../organisationService');
const testOrgs = require('../../testHelpers/testOrgs');
const testEmployees = require('../../testHelpers/testEmployees');
const Organisation = require('../../model/organisation');
const Employee = require('../../model/employee').model;

const newOrg = {
    organisationName: 'myneworg',
    logoImg: 'testimg.gif',
    backgroundImg: 'testimg.gif',
    allowedMailDomains: ['domain1.com', 'domain2.com'],
    email: 'testmail@domain1.com',
    firstName: 'John',
    lastName: 'Hankson',
    position: 'CEO'
};
const realTestImg = 'testimg.gif';

describe('Organisation service tests', () => {
    let organisation;

    beforeAll(async () => {
        await mockgoose.prepareStorage();
        await mongoose.connect('mongodb://example.com/test', { useNewUrlParser: true, bufferMaxEntries: 0 });
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
    });

    test('Organisation created when conditions are met (createOrganisation)', async () => {
        const organisation = await organisationService.createOrganisation(newOrg.organisationName, newOrg.logoImg, newOrg.backgroundImg, newOrg.allowedMailDomains);

        expect(organisation.organisationName).toBe(newOrg.organisationName);
        expect(organisation.logoImg).toBe(newOrg.logoImg);
    });

    test('Error thrown when organisation already exists (createOrganisation)', async done => {
        try {
            await organisationService.createOrganisation(testOrgs.schiphol.organisationName, newOrg.logoImg, newOrg.backgroundImg, newOrg.allowedMailDomains);
        } catch (err) {
            expect(err.message).toBe(`There already is an organisation with name ${testOrgs.schiphol.organisationName}`);
            expect(err.type).toBe('Invalid organisation name');
            expect(err.status).toBe(400);
            done();
        }
    });

    test('No error thrown when images exist (verifyImages)', async () => {
        const result = await organisationService.verifyImages(realTestImg);
        expect(result).toBe(true);
    });

    test('Error thrown when one image does not exist', async done => {
        try {
            await organisationService.verifyImages(realTestImg, '__fake');
        } catch (err) {
            expect(err.message).toBe(`One or more of the provided image URI's does not point to an existing image`);
            expect(err.type).toBe(`Invalid imaage URI('s)`);
            expect(err.status).toBe(400);
            done();
        }
    });
});