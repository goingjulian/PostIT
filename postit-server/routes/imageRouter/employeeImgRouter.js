const express = require('express');
const router = express.Router();
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();

const httpError = require('../../errors/httpError');
const imageService = require('../../service/imageService');
const promiseWrappers = require('../../helpers/promiseWrappers');

router.use('/', async (req, res, next) => {
    try {
        const filePath = path.join(__dirname + `/../public/uploads/${req.employee._id}`);
        req.fileName = `${req.employee._id}-profile`;
        const file = await promiseWrappers.readFileP(filePath);
        if (file) await promiseWrappers.unlinkP(filePath);
        next();
    } catch (err) {
        if (err.status) next(err);
        if (err.code === "ENOENT") next();
        else throw err;
    }
});

/**
 * @api {put} organisations/:organisationName/employees/profilePic Upload new profile picture of a user
 * @apiName uploadProfilePic
 * @apiGroup Organisation/Employees
 * @apiDescription This endpoint can be used to upload a profile picture for a user
 *
 * @apiParam {File} image The image file that needs to be saved on the server (format must be .jpg, .gif or .png)
 * @apiParam {String} organisationName The name of the non-existing organisation that the image is destined for
 *
 * @apiSuccess {String} success Success indicator
 * @apiSuccess {String} fileName Filename of the uploaded image on the server
 *
 * @apiSuccessExample File successfully uploaded:
 *     HTTP/1.1 200 OK
 *     { "success": true,
 *       "employeeMail": "mail@domain.com",
 *       "fileName": "filename.jpg"
 *     }
 *
 * @apiUse serverErr
 * @apiErrorExample {json} Something has gone wrong while trying to upload the image
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Image upload error",
 *       "message": "Something went wrong when trying to upload your image"
 *     }
 * @apiErrorExample {json} File is too large
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Image upload error",
 *       "message": "The provided image is too large"
 *     }
 * @apiErrorExample {json} Form field has the wrong name
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Image upload error",
 *       "message": "Something has gone wrong during the image upload. Please check the form field name, it should be 'image"
 *     }
 * @apiUse authErr
 */
router.put('/', imageService.upload.single('image'), (req, res, next) => {
    try {
        if (req.file === undefined)
            throw new httpError('Image upload error', 'Something went wrong when trying to upload your image, please check the file type and size of your image', 400);

        res.json({
            success: true,
            employeeMail: req.employee.email,
            fileName: req.file.filename
        });
    } catch (err) {
        if (err.status) return next(err);
        throw err;
    }
});

router.use('/', (err, req, res, next) => {
    if (err.message === 'Unexpected field') next(new httpError(`Image upload error`, `Something has gone wrong during the image upload. Please check the form field name, it should be 'image'`, 400));
    else if (err.message === 'File too large') next(new httpError(`Image upload error`, `The provided image is too large`, 400));
    else next(err);
});

module.exports = router;
