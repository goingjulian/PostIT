const Idea = require('../../model/idea').model;

const ideaService = require('../ideaService');
const testOrgs = require('../../testHelpers/testOrgs');

describe('Idea service tests', () => {
    test('True returned if upvote from employee is already present (employeeAlreadyUpvoted)', () => {
        const ideaMock = { upvotes: ['sessionId', 'foo', 'bar'] };
        expect(ideaService.employeeAlreadyUpvoted(ideaMock.upvotes, 'sessionId')).toBe(true);
    });

    test('False returned if upvote from employee is not present (employeeAlreadyUpvoted)', () => {
        const ideaMock = { upvotes: ['foo', 'bar'] };
        expect(ideaService.employeeAlreadyUpvoted(ideaMock.upvotes, 'sessionId')).toBe(false);
    });

    test('Idea found if id is valid (getIdeaById)', () => {
        const idea = new Idea({title: 'testIdea', upvotes: [] });
        const orgCopy = { ...testOrgs.schiphol };
        orgCopy.ideas.push(idea);
        const mockReq = { params: { ideaId: idea._id.toString() }, organisation: orgCopy };

        ideaService.getIdeaById(mockReq, undefined, () => { });
        expect(mockReq.idea.title).toBe(idea.title);
    });

    test('Error returned if id is invalid (getIdeaById)', () => {
        const idea = new Idea({title: 'testIdea', upvotes: [] });
        const orgCopy = { ...testOrgs.schiphol };
        orgCopy.ideas.push(idea);
        const mockReq = { params: { ideaId: 1 }, organisation: orgCopy };

        ideaService.getIdeaById(mockReq, undefined, (error) => {
            expect(error).toMatchObject({ type: 'Idea not found', message: 'No idea found for the given id', status: 404 });
        });

        expect(mockReq.idea).toBeUndefined();
    });
});