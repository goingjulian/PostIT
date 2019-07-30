const puppeteer = require('puppeteer');
const paramValidityService = require('../service/paramValidityService');

jest.setTimeout(30000);

describe('Overview', () => {
    let browserA, pageA, organisation, organisationName, app;

    beforeAll(async () => {
        browserA = await puppeteer.launch({
            headless: true,
            slowMo: 50,
            args: [ '--window-size=700,800', '--window-position=0,0' ]
        });
        pageA = await browserA.newPage();
        organisationName = "schiphol";
    });

    beforeEach(async () => {
        await pageA.goto(`http://localhost:3000/${organisationName}`);
        await pageA.waitFor('#overview');
    });



    afterAll(async () => {
        await browserA.close();
    });

    test('Test that overview can be loaded in browser A', async () => {
        const overviewSection = await pageA.waitFor('#overview');
        expect(overviewSection).not.toBeUndefined();
    });

    test('Test redirect to login click add idea not logged in', async () => {
        await pageA.waitFor('#add-button');
        await pageA.click('#add-button');
        const loginSection = await pageA.waitFor('#login');
        expect(loginSection).not.toBeUndefined();
    });

    test('Test that login email can be sent', async () => {
        await pageA.waitFor('#add-button');
        await pageA.click('#add-button');
        await pageA.waitFor('#login');

        await pageA.focus('#email');
        await pageA.keyboard.type('armadillo');
        await pageA.select('#domain-select', 'nickspijker.nl');
        await pageA.click('#submit-login');
    });
});