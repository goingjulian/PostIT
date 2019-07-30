const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const logger = require('../helpers/postit-logger');
const promiseWrappers = require('../helpers/promiseWrappers');
const functions = require('../helpers/functions');

const mailHost = process.env.EMAIL_HOST || 'localhost';
const mailPort = process.env.EMAIL_PORT || 143;
const mailAddr = process.env.EMAIL_ADDR || 'youremail@gmail.com';
const mailPass = process.env.EMAIL_PASSWORD || 'yourpassword';
const clientURL = process.env.EMAIL_BASE_URL_TO_PAGE || 'localhost';

const imageServerURL = process.env.IMAGE_SERVER_URL || 'localhost';
const imageServerPort = process.env.IMAGE_SERVER_PORT || 80;
const imageServerProtocol = process.env.IMAGE_SERVER_PROTOCOL || 'https';

const securePort = 465;
let transporter;

module.exports.initMail = async () => {
    try {
        logger.info(`Initializing mail server with host: ${mailHost}, port: ${mailPort}, address: ${mailAddr}`)
        transporter = await nodemailer.createTransport({
            host: mailHost,
            port: mailPort,
            secure: mailPort === securePort,
            auth: {
                user: mailAddr,
                pass: mailPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        logger.info(`Mail server initialized`);

        logger.info(`Verifying e-mail connection`);

        await transporter.verify();

        logger.info(`E-mail connection is valid`);
    } catch (err) {
        logger.error(`Error during mail init, ${err.message}`);
    }
};

module.exports.sendLoginMail = async (address, organisationName, organisationLogo, token) => {
    try {
        logger.info(`Sending e-mail to ${address}`);

        let content = await promiseWrappers.readFileP('./emailtemplates/emailTemplate.html');
        const mapObj = {
            ":title": "PostIT e-mail verification",
            ":subtitle": `Click on the button below to login to ${functions.capitalizeFirstLetter(organisationName)}`,
            ":img":  `${imageServerProtocol}://${imageServerURL}:${imageServerPort}/img/${organisationLogo}`,
            ":buttontext":  "Start posting some ideas",
            ":url" : `${clientURL}/${organisationName}/verify/${token}`,
            ":linktosite" : `${clientURL}/${organisationName}/`
        };
        content = content.replace(/:title|:img|:buttonText|:url|:linktosite|:subtitle/gi, function(matched){
            return mapObj[matched];
        });

        let info = await transporter.sendMail({
            from: `"PostIT: ${functions.capitalizeFirstLetter(organisationName)}" <${mailAddr}>`,
            to: `${address}`,
            subject: "Sign in to your account",
            html: content
        });
        logger.info(`Message sent: ${info.messageId}`);
    } catch(err) {
        logger.error(`Error during mail send, ${err.message}`)
    }
}
