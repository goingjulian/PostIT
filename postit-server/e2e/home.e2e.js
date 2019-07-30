const puppeteer = require('puppeteer');

jest.setTimeout(30000);

describe('Overview', () => {
    let browserA, pageA, organisationName, app;

    beforeAll(async () => {
        browserA = await puppeteer.launch({
            headless: true,
            slowMo: 50,
            args: [ '--window-size=900,900', '--window-position=0,0' ]
        });
        pageA = await browserA.newPage();
        organisationName = Date.now().toString();
    });

    afterAll(async () => {
        await browserA.close();
    });

    test('Test that overview can be loaded in browser A', async () => {
        await pageA.goto(`http://localhost:3000/`);
        const addOrgForm = await pageA.waitFor('#addOrgForm');
        expect(addOrgForm).not.toBeUndefined();
    });

    test('Test organisation can be added in browser A stage 0', async () => {
        //stage 0
        await pageA.goto(`http://localhost:3000/`);
        await pageA.waitFor('#addOrgForm');
        await pageA.focus('#organisationName');
        await pageA.keyboard.type(organisationName);
        await pageA.click('#next-button');
    });

    test('Test organisation can be added in browser A stage 1', async () => {
        //stage 1
        let uploadButtons = await pageA.$$('[type="file"]');
        const logoUpload  = uploadButtons[0];
        await logoUpload.uploadFile('e2e/images/person.png');
        const backgroundUpload  = uploadButtons[1];
        await backgroundUpload.uploadFile('e2e/images/person.png');
        await pageA.click('#next-button');
    });

    test('Test organisation can be added in browser A stage 2', async () => {
        //stage 2
        await pageA.waitFor('#allowedMailDomains');
        await pageA.focus('#allowedMailDomains');
        await pageA.keyboard.type("ikbeneenrobot.com");
        const addDomainButton = await pageA.$('div#addOrgForm.box div.field.has-addons div.control button.is-right.button.is-info');
        await addDomainButton.click();
        await pageA.click('#next-button');
    });

    test('Test organisation can be added in browser A stage 3', async () => {
        //stage 3
        await pageA.waitFor('#email');
        await pageA.focus('#email');
        await pageA.keyboard.type("Robbie");
        await pageA.focus('#firstName');
        await pageA.keyboard.type("Robbie");
        await pageA.focus('#lastName');
        await pageA.keyboard.type("de Robot");
        await pageA.focus('#position');
        await pageA.keyboard.type("Automatische Tester");
        await pageA.click('#next-button');
    });


    test('Test organisation can be added in browser A stage success', async () => {
        //success
        await pageA.waitFor('#waitForMail');
        await pageA.goto(`http://localhost:3000/${organisationName}`);
        await pageA.waitFor('#overview');
    });
});