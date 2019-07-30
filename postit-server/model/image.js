const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new mongoose.Schema(
    {
        imageName: {
            type: String,
            required: true
        },
        imageData: {
            type: String,
            required: true
        }
    },
    { versionKey: false }
);

module.exports = imageSchema;
module.exports.model = mongoose.model("Image", imageSchema);
