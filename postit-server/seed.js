const Organisation = require('./model/organisation');
const Employee = require('./model/employee').model;
const exampleOrgs = require('./testHelpers/testOrgs');
const testEmployees = require('./testHelpers/testEmployees');
const logger = require('./helpers/postit-logger');

async function insertExampleOrgs() {
    logger.dev('Planting seed');
    await Organisation.deleteMany({});

    const schipholCopy = {...exampleOrgs.schiphol};
    const HANCopy = {...exampleOrgs.HAN};

    const carlCopy = {...testEmployees.regCarl};
    const lelystadCopy = {...testEmployees.lelystad};
    const fritzlarsmaCopy = {...testEmployees.fritzlarsma};
    
    schipholCopy.employees = [new Employee(carlCopy), new Employee(lelystadCopy)];
    await Organisation.insertMany([exampleOrgs.schiphol, exampleOrgs.postit, exampleOrgs.HAN]);
    logger.dev('Seeds planted');
}

module.exports = insertExampleOrgs;