import {resetStoreAction, theStore} from "../../index";
import {
    addIdeaClearErrorAction,
    addIdeaErrorAction,
    ideaAddedAction,
    newIdeasFetchedAction, noIdeaFoundAction,
    noIdeasFoundAction,
    toggleCreateIdeaFormAction, updateIdeaAction
} from "../../actions/ideas.actions";
import {loginCompleteAction, logoutCompleteAction, resetPromptLoginAction} from "../../actions/authentication.actions";

describe('ReducerIdeasOverview tests', () => {
    let expected = null;
    let result = null;
    const idea1 = {
        "upvotes": [
            "xEXGAnrH_v",
            "m-R3k28B5"
        ],
        "comments": [],
        "_id": "5d00bdabca6cd41644b6c6e9",
        "author": "5ce7daf0b496b8df3b53a2ef",
        "authorFirstName": "Jan",
        "authorLastName": "Janssen",
        "authorPosition": "CEO",
        "authorProfPicURL": null,
        "title": "test",
        "description": "test"
    }
    const idea2 = {
        "upvotes": [],
        "comments": [],
        "_id": "5d00be6bca6cd41644b6c6eb",
        "author": "5ce7daf0b496b8df3b53a2ef",
        "authorFirstName": "Jan",
        "authorLastName": "Janssen",
        "authorPosition": "CEO",
        "authorProfPicURL": null,
        "title": "edge",
        "description": "edge"
    }

    beforeEach(async () => {
        expected = null;
        result = null;
        theStore.dispatch(resetStoreAction());
    });

    test('toggleCreateIdeaFormAction', () => {
        theStore.dispatch(toggleCreateIdeaFormAction(true));
        result = theStore.getState();
        expect(result.ideasOverview.createIdeaField).toBeTruthy();

    });

    test('ideaAddedAction', () => {
        theStore.dispatch(ideaAddedAction(idea1));
        result = theStore.getState();
        expect(result.ideasOverview.ideas).toEqual([idea1]);
        expect(result.ideasOverview.ideas[0]).toEqual(idea1);
        expect(result.ideasOverview.ideas.length).toEqual(1);

        theStore.dispatch(ideaAddedAction(idea2));
        result = theStore.getState();
        expect(result.ideasOverview.ideas).toEqual([idea1,idea2]);
        expect(result.ideasOverview.ideas[1]).toEqual(idea2);
        expect(result.ideasOverview.ideas.length).toEqual(2);

    });

    test('newIdeasFetchedAction', () => {
        theStore.dispatch(newIdeasFetchedAction(idea1));
        result = theStore.getState();

        expect(result.ideasOverview.ideas).toBeTruthy();
        expect(typeof result.ideasOverview.ideas).toBe('object');
        expect(result.ideasOverview.ideas).toEqual(idea1);

        theStore.dispatch(newIdeasFetchedAction([idea1, idea2]));
        result = theStore.getState();

        expect(result.ideasOverview.ideas).toEqual([idea1, idea2]);
        expect(result.ideasOverview.ideas[1]).toEqual(idea2);
        expect(result.ideasOverview.ideas.length).toEqual(2);
    });

    test('noIdeasFoundAction', () => {
        expected = "No ideas found";
        theStore.dispatch(noIdeasFoundAction(expected));
        result = theStore.getState();
        expect(result.ideasOverview.errorMessageIdeaList).toBeTruthy();
        expect(result.ideasOverview.errorMessageIdeaList).toEqual(expected);
    });

    test('noIdeaFoundAction', () => {
        expected = "No idea found";
        theStore.dispatch(noIdeaFoundAction(expected));
        result = theStore.getState();
        expect(result.ideasOverview.errorMessageDetailPage).toBeTruthy();
        expect(result.ideasOverview.errorMessageDetailPage).toEqual(expected);

    });

    test('addIdeaErrorAction', () => {
        expected = "No idea found";
        theStore.dispatch(addIdeaErrorAction(expected));
        result = theStore.getState();
        expect(result.ideasOverview.errorMessageIdeaAdded).toBeTruthy();
        expect(result.ideasOverview.errorMessageIdeaAdded).toEqual(expected);
    });

    test('addIdeaClearErrorAction', () => {
        theStore.dispatch(addIdeaErrorAction("No idea found"));

        theStore.dispatch(addIdeaClearErrorAction());
        result = theStore.getState();
        expect(result.ideasOverview.errorMessageIdeaAdded).toBeFalsy();
    });

    test('updateIdeaAction', () => {
        theStore.dispatch(ideaAddedAction(idea1));
        theStore.dispatch(ideaAddedAction(idea2));
        expected = Object.assign(idea1, {comments:["Een comment"]});
        theStore.dispatch(updateIdeaAction(expected));
        result = theStore.getState();

        expect(result.ideasOverview.ideas).toEqual([expected,idea2]);
        expect(result.ideasOverview.ideas[0]).toEqual(expected);
        expect(result.ideasOverview.ideas.length).toEqual(2);
    });

    test('logoutCompleteAction', () => {
        theStore.dispatch(toggleCreateIdeaFormAction(true));
        theStore.dispatch(addIdeaErrorAction("Idea could not be added"));

        theStore.dispatch(logoutCompleteAction());
        result = theStore.getState();

        expect(result.ideasOverview.createIdeaField).toBeFalsy();
        expect(result.ideasOverview.errorMessageIdeaAdded).toBeFalsy();
    });

    test('resetPromptLoginAction', () => {
        theStore.dispatch(toggleCreateIdeaFormAction(true));
        theStore.dispatch(resetPromptLoginAction());
        result = theStore.getState();

        expect(result.ideasOverview.createIdeaField).toBeFalsy();
    });
});
