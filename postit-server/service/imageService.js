const path = require("path");
const multer = require('multer');
const dotenv = require('dotenv');
dotenv.config();

const imageServerURL = process.env.IMAGE_SERVER_URL || 'localhost';
const imageServerPort = process.env.IMAGE_SERVER_PORT || 80;
const imageServerProtocol = process.env.IMAGE_SERVER_PROTOCOL || 'https';

const maxSizeMB = parseInt(process.env.IMAGE_MAX_SIZE_IN_MB) || 1;

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
const fileFilter = (req, file, cb) => allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);

const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: async (req, file, cb) => {
        cb(null, `${req.fileName}${path.extname(file.originalname)}`);
    }
});

module.exports.upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * maxSizeMB },
    fileFilter: fileFilter
});

module.exports.convertToImageURL = fileName => fileName ? `${imageServerProtocol}://${imageServerURL}:${imageServerPort}/img/${fileName}` : null;

module.exports.convertToAssetsURL = fileName => fileName ? `${imageServerProtocol}://${imageServerURL}:${imageServerPort}/assets/${fileName}` : null;