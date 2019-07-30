const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const comment = require('./comment');

const ideaSchema = new mongoose.Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        authorFirstName: {
            type: String,
            required: true
        },
        authorLastName: {
            type: String,
            required: true,
        },
        authorPosition: {
            type: String,
            required: true
        },
        authorProfPicURL: {
            type: String
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        upvotes: {
            type: [String],
            required: true,
            default: []
        },
        comments: {
            type: [comment],
            default: []
        }
    },
    { versionKey: false }
);

module.exports = ideaSchema;
module.exports.model = mongoose.model("Idea", ideaSchema);
