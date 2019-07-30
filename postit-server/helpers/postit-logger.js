const morgan = require('morgan');

const switchToWhite = "\x1b[37m";
const switchToGreen = "\x1b[32m";
const switchToRed = "\x1b[31m";
const switchToYellow = "\x1b[33m";
const switchToMagenta = "\x1b[35m";
const switchToBlue = "\x1b[34m";

module.exports.warn = message => {
    console.warn(switchToYellow, "WARNING", switchToWhite, renderLoggingMessage(message));
}

module.exports.dev = message => {
    console.debug(switchToMagenta, "DEVELOPMENT", switchToWhite, renderLoggingMessage(message));
}

module.exports.error = message => {
    console.error(switchToRed, "ERROR", switchToWhite, renderLoggingMessage(message));
}

module.exports.info = message => {
    console.info(switchToGreen, "INFO", switchToWhite, renderLoggingMessage(message));
}

module.exports.morganLogger = morgan(`${switchToBlue} REQUEST ${switchToWhite} :method :url :status - :response-time ms`);

function renderLoggingMessage(message) {
    const current = new Date();
    return `${message} | ${current.toLocaleDateString()} ${current.toLocaleTimeString()}`
}