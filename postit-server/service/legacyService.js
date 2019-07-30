const path = require('path');

const promiseWrappers = require('../helpers/promiseWrappers');

module.exports.renderFullPageByFileName = async (fileName, organisationName, logoSrc) => {
    const templateFile = await promiseWrappers.readFileP(path.join(__dirname, '../legacy-app/index.html'));
    const mapObj = {
        ":root": await promiseWrappers.readFileP(path.join(__dirname, `../legacy-app/${fileName}`)),
        ":organisationName": organisationName,
        ":logoSrc": logoSrc
    };
    return templateFile.replace(/:root|:organisationName|:logoSrc/gi, matched => mapObj[matched]);
}

module.exports.renderFullPageByString = async (html, organisationName, logoSrc) => {
    const templateFile = await promiseWrappers.readFileP(path.join(__dirname, '../legacy-app/index.html'));
    const mapObj = {
        ":root": html,
        ":organisationName": organisationName,
        ":logoSrc": logoSrc
    };
    return templateFile.replace(/:root|:organisationName|:logoSrc/gi, matched => mapObj[matched]);
}

module.exports.renderIdeasPage = async (ideas, organisationName) => {
    const ideasCopy = ideas.sort((a, b) => (b.upvotes.length - a.upvotes.length));
    let ideaListHTML = '';

    for (idea of ideasCopy) {
        ideaListHTML += await renderIdeaForOverview(idea.title, idea.description, 
            idea.upvotes.length, `${idea.authorFirstName} ${idea.authorLastName} - ${idea.authorPosition}`,
            organisationName, idea._id);
    }

    const templateFile = await promiseWrappers.readFileP(path.join(__dirname, '../legacy-app/template-ideas.html'));
    const mapObj = {
        ":ideas": ideaListHTML
    };
    return templateFile.replace(/:ideas/gi, matched => mapObj[matched]);
}

module.exports.renderSingleIdeaPage = async idea => {
    const templateFile = await promiseWrappers.readFileP(path.join(__dirname, '../legacy-app/template-idea.html'));
    const mapObj = {
        ":author": `${idea.authorFirstName} ${idea.authorLastName}`,
        ":position": idea.authorPosition,
        ":title": idea.title,
        ":description": idea.description,
        ":upvotes": idea.upvotes.length,
        ":comments": await renderComments(idea.comments)
    };
    return templateFile.replace(/:author|:position|:title|:description|:comments|:upvotes/gi, matched => mapObj[matched]);
}

async function renderIdeaForOverview(title, description, upvotes, author, organisationName, ideaId) {
    const templateFile = await promiseWrappers.readFileP(path.join(__dirname, '../legacy-app/template-idea-on-overview.html'));
    const mapObj = {
        ":title": title,
        ":description": description,
        ":upvotes": upvotes,
        ":author": author,
        ":organisationName": organisationName,
        ":ideaId": ideaId
    };
    return templateFile.replace(/:title|:description|:upvotes|:author|:organisationName|:ideaId/gi, matched => mapObj[matched]);
}

async function renderComments(comments) {
    let commentListHTML = '';

    for (comment of comments) {
        const templateFile = await promiseWrappers.readFileP(path.join(__dirname, '../legacy-app/template-comment.html'));
        const mapObj = {
            ":author": `${comment.authorFirstName} ${comment.authorLastName}`,
            ":position": comment.authorPosition,
            ":comment": comment.comment,
            ":upvotes": comment.upvotes
        };
        commentListHTML += templateFile.replace(/:author|:position|:comment/gi, matched => mapObj[matched]);
    }
    return commentListHTML;
}