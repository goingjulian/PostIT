const express = require('express');
const router = express.Router();
const path = require('path');

const Organisation = require('../model/organisation');
const legacyService = require('../service/legacyService');
const imageService = require('../service/imageService');

router.use('/assets', express.static(path.join(__dirname, '../legacy-app/assets')));

router.get('/error', async (req, res, next) => {
    try {
        res.send(await legacyService.renderFullPageByFileName('template-error.html', '', imageService.convertToAssetsURL('logo.png')));
    } catch (err) {
        next(err);
    }
});

router.get('/', async (req, res, next) => {
    try {
        res.send(await legacyService.renderFullPageByFileName('template-index.html', '', imageService.convertToAssetsURL('logo.png')));
    } catch (err) {
        res.redirect('/legacy/error');
    }
});

router.get('/:organisationName', async (req, res, next) => {
    try {
        const organisation = await Organisation.findOrganisationByName(req.params.organisationName);
        if (organisation === null) throw new Error('Invalid organisation name');

        if (organisation.ideas.length < 1) {
            return res.send(await legacyService.renderFullPageByFileName('template-noideas.html', 'avc', imageService.convertToAssetsURL('logo.png')));
        } else {
            const ideaPage = await legacyService.renderIdeasPage(organisation.ideas, organisation.organisationName);
            res.send(await legacyService.renderFullPageByString(ideaPage, organisation.organisationName, imageService.convertToImageURL(organisation.logoImg)));
        }
    } catch (err) {
        res.redirect('/legacy/error');
    }
});

router.get('/:organisationName/idea/:ideaId', async (req, res, next) => {
    try {
        const organisation = await Organisation.findOrganisationByName(req.params.organisationName);
        if (organisation === null) throw new Error('Invalid organisation name');

        const idea = organisation.ideas.find(idea => idea._id.equals(req.params.ideaId));

        if (idea === null) throw new Error('Idea ID is invalid');

        const ideaPage = await legacyService.renderSingleIdeaPage(idea);
        res.send(await legacyService.renderFullPageByString(ideaPage, organisation.organisationName, imageService.convertToImageURL(organisation.logoImg)));
    } catch (err) {
        res.redirect('/legacy/error');
    }
});


module.exports = router;
