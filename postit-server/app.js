const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const logger = require('./helpers/postit-logger');
const regex = require('./helpers/regex');
const organisationRouter = require('./routes/organisationRouter');
const legacyRouter = require('./routes/legacyRouter');
const app = express();

function initApp(sessionParser) {
    app.use(cors({ origin: true, credentials: true }));
    app.use(bodyParser.json());

    app.use(sessionParser);

    app.use(logger.morganLogger);

    app.use('/organisations', organisationRouter);

    app.use('/doc', express.static('./apidoc'));

    app.use('/assets', express.static('./public/assets'));
    app.use('/img', express.static('./public/uploads'));

    app.use('/static', express.static('./public/client/static'));
    app.use('/media', express.static('./public/client/media'));

    app.use('/custom-service-worker.js', express.static('./public/client/custom-service-worker.js'));
    app.use('/manifest.json', express.static('./public/client/manifest.json'));
    app.use('/favicon.ico', express.static('./public/client/favicon.ico'));

    app.use('/legacy', legacyRouter);

    app.use('/:organisationName/idea/:ideaId', (req, res, next) => {
        const userAgent = req.headers['user-agent'];

        if (regex.isIE.test(userAgent)) {
            res.redirect(`/legacy/${req.params.organisationName}/idea/${req.params.ideaId}`);
        } else {
            next();
        }
    });

    app.use('/:organisationName', (req, res, next) => {
        const userAgent = req.headers['user-agent'];

        if (regex.isIE.test(userAgent)) {
            res.redirect(`/legacy/${req.params.organisationName}`);
        } else {
            next();
        }
    });

    app.get('*', (req, res) => {
        const userAgent = req.headers['user-agent'];

        if (regex.isIE.test(userAgent)) {
            res.redirect('/legacy');
        } else {
            res.sendFile('index.html', { root: 'public/client' });
        }
    });

    app.use((err, req, res, next) => {
        if (err.status) res.status(err.status).json({
            type: err.type,
            message: err.message, ...(err.sessionUid ? { sessionUid: err.sessionUid } : null)
            , ...(err.excludedOrgNotifications ? { excludedOrgNotifications: err.excludedOrgNotifications } : null)
        });
        else {
            logger.error(`Server error returned, error message: ${err.message}`);
            res.status(500).send('An error occured on the server while processing your request');
        }
    });

    return app;
}

module.exports.initApp = initApp;
