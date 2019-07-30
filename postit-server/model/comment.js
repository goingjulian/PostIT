const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema(
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
            required: true
        },
        authorPosition: {
            type: String,
            required: true
        },
        authorProfPicURL: {
            type: String
        },
        comment: {
            type: String,
            required: true
        },
        upvotes: {
            type: [String],
            required: true,
            default: []
        },
    },
    { versionKey: false }
);

module.exports = commentSchema;
module.exports.model = mongoose.model("Comment", commentSchema);;

