const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const paramValidityService = require('../paramValidityService');
const testOrgs = require('../../testHelpers/testOrgs');
const testEmployees = require('../../testHelpers/testEmployees');
const Organisation = require('../../model/organisation');
const Employee = require('../../model/employee').model;

describe('Parameter validity tests', () => {
    test('Error is thrown when one parameter is undefined', () => {
        expect(() => {
            paramValidityService.checkBodyParamsValidity(['param1', undefined, 'param3']);
        }).toThrow();
    });

    test('Error is thrown when one parameter is wrong type', () => {
        expect(() => {
            paramValidityService.checkBodyParamsValidity(['param1', 12, 'param3']);
        }).toThrow();
    });

    test('Error is thrown when string is passed to function', () => {
        expect(() => {
            paramValidityService.checkBodyParamsValidity('param1');
        }).toThrow();
    });

    test('No error is thrown when parameters are correct', () => {
        expect(paramValidityService.checkBodyParamsValidity(['param1', 'param2', 'param3'])).toBeUndefined();
    });
});

describe('Parse organisation and e-mail tests, (parseOrganisation, parseEmail)', () => {
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
        organisation = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);
        const carlCopy = { ...testEmployees.regCarl };
        const carl = new Employee(carlCopy);
        organisation.employees.push(carl);
        await organisation.save();
    });

    test('Organisation is parsed if it exists in DB (parseOrganisation)', async () => {
        const mockReq = { params: { organisationName: testOrgs.schiphol.organisationName } };

        await paramValidityService.parseOrganisation(mockReq, undefined, () => { });

        const org = mockReq.organisation;

        expect(org.organisationName).toBe(testOrgs.schiphol.organisationName)
        expect(org.logoImg).toBe(testOrgs.schiphol.logoImg)
    });

    test('Error is thrown when organisation doesn\'t exist (parseOrganisation)', async () => {
        const mockReq = { params: { organisationName: "fake" } };

        await paramValidityService.parseOrganisation(mockReq, undefined, (result) => {
            expect(result.message).toBe('Organisation not found');
            expect(result.type).toBe('Invalid url');
        });

        expect(mockReq.organisation).toBeUndefined();
    });

    test('Error is thrown when email is of wrong format (parseEmail)', async () => {
        const mockReq = { organisation: organisation, params: {email: 'test@test' }};

        await paramValidityService.parseEmail(mockReq, undefined, (err) => {
            expect(err.message).toBe('The provided e-mail address is of an valid format');
            expect(err.type).toBe('Invalid e-mail');
            expect(err.status).toBe(400);
        });

        expect(mockReq.employee).toBeUndefined();

    });

    test('Error is thrown when email is not tied to employee (parseEmail)', async () => {
        const mockReq = { organisation: organisation, params: { email: 'notcarl@test.com' } };
        await paramValidityService.parseEmail(mockReq, undefined, (err) => {
            expect(err.message).toBe(`Employee with email notcarl@test.com not found`);
            expect(err.type).toBe('Invalid url');
            expect(err.status).toBe(404);
        });

        expect(mockReq.employee).toBeUndefined();

    });

    test('Employee parsed when email is correct (parseEmail)', async () => {
        const mockReq = { organisation: organisation, params: { email: testEmployees.regCarl.email }};

        await paramValidityService.parseEmail(mockReq, undefined, () => {});

        const employee = mockReq.employee;

        expect(employee.email).toBe(testEmployees.regCarl.email);
        expect(employee.firstName).toBe(testEmployees.regCarl.firstName);
        expect(employee.lastName).toBe(testEmployees.regCarl.lastName);
        expect(employee.position).toBe(testEmployees.regCarl.position);
    });
});