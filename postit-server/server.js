/*
  /$$$$$$$                       /$$    /$$$$$$ /$$$$$$$$
| $$__  $$                     | $$   |_  $$_/|__  $$__/
| $$  \ $$ /$$$$$$   /$$$$$$$ /$$$$$$   | $$     | $$   
| $$$$$$$//$$__  $$ /$$_____/|_  $$_/   | $$     | $$   
| $$____/| $$  \ $$|  $$$$$$   | $$     | $$     | $$   
| $$     | $$  | $$ \____  $$  | $$ /$$ | $$     | $$   
| $$     |  $$$$$$/ /$$$$$$$/  |  $$$$//$$$$$$   | $$   
|__/      \______/ |_______/    \___/ |______/   |__/                                                         

Copyright (c) 2019, Julian Korf de Gidts, Randy Grouls, Kevin van Schaijk 
All rights reserved. 

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met: 

 * Redistributions of source code must retain the above copyright notice, 
   this list of conditions and the following disclaimer. 
 * Redistributions in binary form must reproduce the above copyright 
   notice, this list of conditions and the following disclaimer in the 
   documentation and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND ANY 
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY 
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY 
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH 
DAMAGE. 
*/

const mongoose = require('mongoose');
const http = require('http');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();
const connectMongo = require('connect-mongo');
const ws = require('ws');

const logger = require('./helpers/postit-logger');
const initApp = require('./app.js').initApp;
const websocketActions = require("./websocket/websocketEvents");
const insertExampleOrgs = require('./seed');
const emailService = require('./service/emailService');

const dbName = process.env.DB_NAME || 'ideaboard';
const dbAuth = process.env.DB_AUTH || 'admin';
const dbPort = process.env.DB_PORT || '27017';
const dbUrl = process.env.DB_URL || 'localhost';
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const srv = process.env.DB_SRV || false;

const APIPort = process.env.APP_PORT || 3000;

const secretKey = process.env.SECRET_KEY || "secret";

let httpServer;

let app;

/*========= ENTRY POINT =========*/

connectToMongo();

/*===============================*/

mongoose.connection.on('connecting', () => {
    logger.info(`Trying to connect to the database on ${dbUrl} with port ${dbPort}`);
});

mongoose.connection.on('connected', async () => {
    logger.info(`Database connected succesfully on ${dbUrl} with port ${dbPort}`);
    runHttpServer();
});

mongoose.connection.on('error', error => {
    logger.error(`Error occured during database operation, error: ${error}`);

});

mongoose.connection.on('disconnected', () => {
    logger.error(`Disconnected from database on ${dbUrl} with port ${dbPort}`);
    shutdownHttpServer();
});

mongoose.connection.on('reconnected', () => {
    logger.info(`Reconnected with database on ${dbUrl} with port ${dbPort} after losing connection`);
});

async function connectToMongo() {
    let connectionString;

    if (dbUser && dbPassword) connectionString = `mongodb${srv ? '+srv' : null}://${dbUser}:${dbPassword}@${dbUrl}/${dbName}`;
    else connectionString = `mongodb://${dbUrl}:${dbPort}/${dbName}?authSource=${dbAuth}`;

    await mongoose.connect(connectionString, {
        useNewUrlParser: true,
        bufferMaxEntries: 0
    });
    // await insertExampleOrgs();
}

function runHttpServer() {
    const MongoStore = connectMongo(session);
    const currentDate = new Date();
    sessionParser = session({
        resave: true,
        saveUninitialized: true,
        secret: secretKey,
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
        cookie: { expires: currentDate.setFullYear(currentDate.getFullYear() + 10) }
    });

    app = initApp(sessionParser);
    httpServer = http.createServer(app);

    const webSocketServer = new ws.Server({
        server: httpServer,
        verifyClient: (info, req) => parseSession(info, req)
    });

    function parseSession(info, done) {
        sessionParser(info.req, {}, async () => {
            done(true);
        });
    }

    websocketActions.initWebsocket(webSocketServer);

    httpServer.listen(APIPort, () => {
        logger.info(`HTTP server listening on port ${APIPort}`);
    });

    emailService.initMail();
}

function shutdownHttpServer() {
    logger.warn(`HTTP server shutting down`);
    if (httpServer) httpServer.close(() => {
        logger.error(`HTTP server is offline`);
    });
}

