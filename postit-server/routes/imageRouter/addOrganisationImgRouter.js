const express = require('express');
const router = express.Router();
const path = require("path");

const httpError = require('../../errors/httpError');
const imageService = require('../../service/imageService');
const imgRoles = require('../../helpers/definitions').imgRoles;
const promiseWrappers = require('../../helpers/promiseWrappers');
const Organisation = require('../../model/organisation');

/**
 * Middleware. This does a pre-check before images are uploaded
 */
router.use('/:organisationName/img', async (req, res, next) => {
    try {
        if (req.query.role === undefined) throw new httpError('Missing parameter', 'Missing query parameter \'role\'', 400);
        if (req.query.role !== imgRoles.logo && req.query.role !== imgRoles.background) throw new httpError('Invalid role', 'Image role can only be \'logo\' or \'background\'', 400);

        const organisation = await Organisation.findOrganisationByName(req.params.organisationName);
        if (organisation) throw new httpError('Organisation already exists', `There is already an organisation with name ${req.params.organisationName}. You can't upload images for this organisation`, 403);

        const filePath = path.join(__dirname + `/../public/uploads/${req.params.organisationName}`);

        req.fileName = `${req.params.organisationName}-${req.query.role}`;

        const file = await promiseWrappers.readFileP(filePath);

        if (file) await promiseWrappers.unlinkP(filePath);

        next();
    } catch (err) {
        if (err.status) next(err);
        else if (err.code === "ENOENT") next();
        else throw err;
    }
});

/**
 * @api {post} /organisations/:organisationName/img?role=logo|background Upload an organisation logo- or background image
 * @apiName uploadImage
 * @apiGroup Organisation
 * @apiDescription This endpoint is used during the creation of an organisation. Here, the logo and background images can be uploaded. An organisation can only have one logo and one background image
 *
 * @apiParam {String} organisationName The name of the non-existing organisation that the image is destined for
 * @apiParam {String} role The role of the image (query param)
 * @apiParam {File} image The image file that needs to be saved on the server (format must be .jpg, .gif or .png)
 *
 * @apiSuccess {String} success Success indicator
 * @apiSuccess {String} fileName Filename of the uploaded image on the server
 *
 * @apiSuccessExample File successfully uploaded:
 *     HTTP/1.1 200 OK
 *     { "success": true,
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
 * @apiErrorExample {json} Query parameter is missing
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Image upload error",
 *       "message": "Missing query parameter 'role'"
 *     }
 * @apiErrorExample {json} Wrong image role (can only be 'logo' or 'background')
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "type": "Invalid role",
 *       "message": "Image role can only be 'logo' or 'background'"
 *     }
 * @apiErrorExample {json} Organisation already exists (not allowed to change image)
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "type": "Organisation already exists",
 *       "message": "There is already an organisation with name organisationName. You can't upload images for this organisation'"
 *     }
 */
router.post('/:organisationName/img', imageService.upload.single('image'), (req, res, next) => {
    try {
        if (req.file === undefined)
            throw new httpError('Image upload error', 'Something went wrong when trying to upload your image', 500);

        res.json({
            success: true,
            fileName: req.file.filename
        });
    } catch (err) {
        if (err.status) return next(err);
        throw err;
    }
});

router.use('/:organisationName/img', (err, req, res, next) => {
    if (err.message === 'Unexpected field') next(new httpError(`Image upload error`, `Something has gone wrong during the image upload. Please check the form field name, it should be 'image'`, 400));
    else if (err.message === 'File too large') next(new httpError(`Image upload error`, `The provided image is too large`, 400));
    else next(err);
});

module.exports = router;
