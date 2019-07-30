const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

const authenticationService = require('../authenticationService');
const testOrgs = require('../../testHelpers/testOrgs');
const testEmployees = require('../../testHelpers/testEmployees');
const Organisation = require('../../model/organisation');
const Employee = require('../../model/employee').model;

describe('AuthenticationService tests (employeeInOrganisation)', () => {
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

    test('User saved when conditions are met (handleRegistration)', async () => {
        const employee = await authenticationService.handleRegistration(organisation, testEmployees.unregHank.email, testEmployees.unregHank.firstName, testEmployees.unregHank.lastName, testEmployees.unregHank.position, "1234");

        const updatedOrg = await Organisation.findOrganisationByName(testOrgs.schiphol.organisationName);

        expect(employee.email).toBe(testEmployees.unregHank.email);
        expect(employee.role).toBe('employee');
        expect(employee.token).toBeDefined();
        expect(updatedOrg.employees.find(employee => employee.email === testEmployees.unregHank.email)).toMatchObject(testEmployees.unregHank);
    });

    test('Error returned when email is of invalid format (handleRegistration)', async done => {
        try {
            await authenticationService.handleRegistration(organisation, 'notanemail');
        } catch (err) {
            expect(err.message).toBe('The provided e-mail address is not valid');
            expect(err.type).toBe('Invalid e-mail');
            expect(err.status).toBe(400);
            done();
        }
    });

    test('Error returned when email has unauthorized domain (handleRegistration)', async done => {
        try {
            await authenticationService.handleRegistration(organisation, 'test@notallowed.com');
        } catch (err) {
            expect(err.message).toBe('The provided e-mail address domain is not allowed within this organisation');
            expect(err.type).toBe('E-mail domain is not allowed');
            expect(err.status).toBe(403);
            done();
        }
    });

    test('Error returned when employee is already registered (handleRegistration)', async done => {
        try {
            await authenticationService.handleRegistration(organisation, testEmployees.regCarl.email);
        } catch (err) {
            expect(err.message).toBe('The supplied e-mail has already been used within this organisation');
            expect(err.type).toBe('Invalid e-mail');
            expect(err.status).toBe(400);
            done();
        }
    });

    test('Error returned when token is not tied to any user (getEmployeeFromToken)', async () => {
        const token = '1234abc';
        organisation.employees.find(emp => emp.email === testEmployees.regCarl.email).token = token;

        await organisation.save();

        const result = await authenticationService.getEmployeeFromToken(organisation, token);

        expect(result.email).toBe(testEmployees.regCarl.email);
        expect(result.firstName).toBe(testEmployees.regCarl.firstName);
        expect(result.token).toBe(token);

    });

    test('True returned if user is in organisation (employeeInOrganisation)', async () => {
        const result = await authenticationService.employeeInOrganisation(testEmployees.regCarl.email, organisation);
        expect(result).toBe(true);
    });

    test('False returned if user is not in organisation (employeeInOrganisation)', async () => {
        const result = await authenticationService.employeeInOrganisation(testEmployees.unregJessica.email, organisation);
        expect(result).toBe(false);
    });

    test('True returned when user is authorized (verifyUserAuthorized)', async () => {
        const mockReq = { organisation: organisation, session: { organisations: { schiphol: { email: testEmployees.regCarl.email, role: "employee" } } } };
        authenticationService.verifyUserAuthorized(mockReq, undefined, () => { }, ["employee"]);
        const employee = mockReq.employee;

        expect(employee.email).toBe(testEmployees.regCarl.email);
        expect(employee.firstName).toBe(testEmployees.regCarl.firstName);
        expect(employee.lastName).toBe(testEmployees.regCarl.lastName);
        expect(employee.position).toBe(testEmployees.regCarl.position);
        expect(employee.role).toBe("employee");
    });

    test('Error thrown when user is not authorized (verifyUserAuthorized)', done => {
        const mockReq = { organisation: organisation, session: { organisations: { schiphol: { email: testEmployees.regCarl.email, role: "employee" } } } };

        authenticationService.verifyUserAuthorized(mockReq, undefined, err => {
            expect(err.message).toBe('Please login to access this resource');
            expect(err.type).toBe('Authorization error');
            expect(err.status).toBe(401);
            done();
        }, ["notemployee"]);

        expect(mockReq.employee).toBeUndefined();
    });
});