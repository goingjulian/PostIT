import { CONN_URL, ENV } from "../index";
import { setNotificationTextAction } from "./notification.actions";

export function fetchIdeasForOrganisationAction(organisation) {
    const options = {
        credentials: ENV === 'dev' ? 'include' : 'same-origin'
    };

    return async (dispatch) => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/shared/ideas`, options);
            if (!response.ok) throw Error();
            const ideas = await response.json();
            dispatch(newIdeasFetchedAction(ideas));
        } catch (e) {
            dispatch(noIdeasFoundAction('No ideas found '));
            dispatch(newIdeasFetchedAction([]));
        }
    };
}

export function fetchIdeaForOrganisationAction(organisation, ideaId) {
    const options = {
        credentials: ENV === 'dev' ? 'include' : 'same-origin'
    };

    return async (dispatch) => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/shared/ideas/${ideaId}`, options);
            if (!response.ok) throw Error();
            const idea = await response.json();
            dispatch(updateIdeaAction(idea));
        } catch (e) {
            dispatch(noIdeaFoundAction('Idea could not be found '));
        }
    };
}

export function addIdeaAction(organisation, title, description) {
    const options = {
        method: 'POST',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                title: title,
                description: description

            }),
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/employees/ideas`, options);
            if (!response.ok) throw Error();
            const idea = await response.json();
            dispatch(ideaAddedAction(idea));
            dispatch(addIdeaClearErrorAction());
            dispatch(toggleCreateIdeaFormAction(false));
        } catch (e) {
            dispatch(addIdeaErrorAction("Your idea could not be added"));
            dispatch(toggleCreateIdeaFormAction(true));
        }
    }
}
export function upvoteIdeaAction(organisation, ideaNumber) {
    const options = {
        method: 'PUT',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: {
            "Content-Type": "application/json",
        }
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/shared/ideas/${ideaNumber}/upvotes`, options);
            if (response.status === 403) {
                const err = new Error();
                err.status = 'ALREADY_UPVOTED';
                throw err;
            }
            if (!response.ok) throw new Error();
            const result = await response.json();
            dispatch(updateIdeaAction(result.idea));

        } catch (e) {
            if (e.status === 'ALREADY_UPVOTED') dispatch(setNotificationTextAction("You have already upvoted this idea"));
            else dispatch(setNotificationTextAction("An error occured while trying to upvote the idea"));
        }
    }
}

export function upvoteCommentAction(organisation, ideaNumber, commentNumber) {
    const options = {
        method: 'PUT',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: {
            "Content-Type": "application/json",
        }
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/shared/ideas/${ideaNumber}/comments/${commentNumber}/upvotes`, options);
            if (response.status === 403) {
                const err = new Error();
                err.status = 'ALREADY_UPVOTED';
                throw err;
            }
            if (!response.ok) throw new Error();
            const result = await response.json();
            dispatch(updateIdeaAction(result.idea));

        } catch (e) {
            if (e.status === 'ALREADY_UPVOTED') dispatch(setNotificationTextAction("You have already upvoted this comment"));
            else dispatch(setNotificationTextAction("An error occured while trying to upvote the comment"));
        }
    }
}

export function addCommentAction(organisation, ideaId, comment) {
    const options = {
        method: 'POST',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(
            {
                comment: comment,
            }),
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/employees/ideas/${ideaId}/comments`, options);
            const content = await response.json();
            if (!response.ok) throw Error("Comment could not be posted.");
            dispatch(updateIdeaAction(content.idea));
        } catch (e) {
            dispatch(setNotificationTextAction("An error occured while trying to submit the comment"));
        }
    }
}

export function ideaAddedAction(idea) {
    return { type: "NEW_IDEA_ADDED", idea };
}

export function addIdeaErrorAction(errorMessage) {
    return { type: "NEW_IDEA_ERROR", errorMessage };
}

export function addIdeaClearErrorAction() {
    return { type: "CLEAR_ERROR" };
}

export function newIdeasFetchedAction(ideas) {
    return { type: "NEW_IDEAS_FETCHED", value: ideas };
}

export function noIdeasFoundAction(errorMessage) {
    return { type: 'NO_IDEAS_FOUND', errorMessage };
}

export function noIdeaFoundAction(errorMessage) {
    return { type: 'NO_IDEA_FOUND', errorMessage };
}

export function updateIdeaAction(idea) {
    return { type: "UPDATE_IDEA", idea };
}

export function togglePostCommentFormAction(boolean) {
    return { type: 'TOGGLE_POST_COMMENT_FORM', value: boolean };
}

export function toggleCreateIdeaFormAction(boolean) {
    return { type: 'TOGGLE_CREATE_IDEA_FORM', value: boolean };
}

