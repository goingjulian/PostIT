const httpError = require('../errors/httpError');
const imageService = require('./imageService');

module.exports.getIdeaById = (req, res, next) => {
    const idea_Id = req.params.ideaId;
    const idea = req.organisation.ideas.find(idea => idea._id.equals(idea_Id));
    if (idea === undefined) return next(new httpError('Idea not found', 'No idea found for the given id', 404));

    req.idea = idea;
    next();
}

module.exports.employeeAlreadyUpvoted = (upvotes, sessionUid) => {
    const upvote = upvotes.find(upvote => sessionUid === upvote);
    return upvote === undefined ? false : true;
}

module.exports.updateAuthorOnIdeas = (organisation, employee) => {
    organisation.ideas.forEach(idea => {
        if (idea.author.equals(employee._id)) {
            idea.authorFirstName = employee.firstName;
            idea.authorLastName = employee.lastName;
            idea.authorPosition = employee.position;
            idea.authorProfPicURL = imageService.convertToImageURL(employee.profilePic)
        }

        idea.comments.forEach(comment => {
            if(comment.author.equals(employee._id)) {
                comment.authorFirstName = employee.firstName;
                comment.authorLastName = employee.lastName;
                comment.authorPosition = employee.position;
                comment.authorProfPicURL = imageService.convertToImageURL(employee.profilePic);
            }
        })
    });
    return organisation.ideas;
}
