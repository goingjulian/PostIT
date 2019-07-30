const logger = require('../helpers/postit-logger');

let webSocketServer;

/**
 * Initialize the websocket server
 * 
 * @type {exports}
 * @Param theWebocketServer, needed for websocketActions
 */
exports.initWebsocket = theWebSocketServer => {
    webSocketServer = theWebSocketServer;
    theWebSocketServer.on('connection', (websocket, req) => {
        websocket.sessionId = req.session.id;
        websocket.organisation = req.url.substring(1);
        logger.info(`Websocket connected, organisation: ${websocket.organisation}`);
    });
}

/**
 * Broadcast a message to all employees in an organisation
 * 
 * @param message, Message object sended to other clients
 * @param session, Needed for looking up socket client
 * @param exlude, If you want to exclude yourself from the next message
 */
exports.broadcast = (message = {}, session, exclude = true) => {
    let user = findClient(session);
    if (user) webSocketServer.clients.forEach((client) => {
        if (client.organisation === user.organisation) {
            client == user && exclude ? null : client.send(JSON.stringify(message));
        }
    });
}

/**
 * Broadcast a message to one employee based on session id
 * 
 * @param message, Message object sended to other clients
 * @param session, Needed for looking up socket client
 */
exports.selfBroadcast = (message = {}, session) => {
    let users = findClients(session);
    users.forEach(function (user) {
        user.send(JSON.stringify(message));
    });
}

/**
 * Get a specific client socket
 * @param sessionId, Needed for looking up socket client
 */
function findClient(sessionId) {
    let user = null;
    webSocketServer.clients.forEach(function (client) {
        if (client.sessionId === sessionId) user = client;
    });
    return user;
}

/**
 * Get all client sockets belonging to s certain session id
 * @param sessionId, Needed for looking up socket client
 */
function findClients(sessionId) {
    const users = [];
    webSocketServer.clients.forEach(function (client) {
        if (client.sessionId === sessionId) users.push(client);
    });
    return users;
}



