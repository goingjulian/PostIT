const puppeteer = require('puppeteer');
const Organisation = require('../model/organisation');
const paramValidityService = require('../service/paramValidityService');

jest.setTimeout(3600000);

describe('puppeteer-demo', () => {
    let browserA, pageA, organisationName, organisation;

    beforeAll(async () => {
        browserA = await puppeteer.launch({
            headless: false,
            slowMo: 75,
            // args:[
            //     '--start-fullscreen'
            // ]
        });
        pageA = await browserA.newPage();
        await pageA.setViewport({ width: 1280, height: 1024});
        organisationName = "puppeteer";
    });

    const waitForLogin = async () => {
        await pageA.goto(`http://localhost:3000/${organisationName}/login`);
        await pageA.waitFor('#login');

        await pageA.focus('#email');
        await pageA.keyboard.type('armadillo@nickspijker.nl');
        await pageA.click('#submit-login');

        const overviewSection = await pageA.waitFor('#overview');

        if(overviewSection != undefined) {
            await puppeteerLoop();
        }
    };

    test('puppeteer-demo startup', async () => {
        await waitForLogin();
    });

    const puppeteerLoop  = async () => {
        await pageA.waitFor('#overview');

        //post first idea
        await pageA.click('#add-button-no-content');
        await pageA.focus('#idea-title-input');
        await pageA.keyboard.type('Alle schermen op ooghoogte plaatsen');
        await pageA.focus('#idea-description-input');
        await pageA.keyboard.type('Wat heb ik toch een last van mijn nek!');
        await pageA.click('#submit-idea-button');

        //post second idea
        await pageA.waitFor('#add-button-container');
        await pageA.click('#add-button-container');
        await pageA.focus('#idea-title-input');
        await pageA.keyboard.type('Nieuwe espresso apparaten plaatsen in de lounge');
        await pageA.focus('#idea-description-input');
        await pageA.keyboard.type('Hoe kun je dit nou koffie noemen?');
        await pageA.click('#submit-idea-button');

        //upvote second idea
        const upvoteButtons = await pageA.$$('.level-item.upvote-pointer ');
        await upvoteButtons[1].click();

        //open first idea
        await pageA.waitFor(1000);
        const descriptionLinks = await pageA.$$('#description-link');
        await descriptionLinks[0].click();

        //post comment
        await pageA.waitFor('#add-button-container');
        await pageA.click('#add-button-container');
        await pageA.focus('.textarea');
        await pageA.keyboard.type('Dat vind ik een goed idee!');
        await pageA.click('#submit-comment-button');

        //upvote commment
        await pageA.click('.notUpvoted');

        //back to overview
        await pageA.waitFor(3000);
        await pageA.goto(`http://localhost:3000/${organisationName}`);

        await puppeteerLoop();
    };
});