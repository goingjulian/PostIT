import {resetStoreAction, theStore} from "../../index";
import {togglePostCommentFormAction} from "../../actions/ideas.actions";
import {logoutCompleteAction, resetPromptLoginAction} from "../../actions/authentication.actions";


describe('ReducerDetailpage tests', () => {
    let expected = null;
    let result = null;

    beforeEach(async () => {
        expected = null;
        result = null;
        theStore.dispatch(resetStoreAction());
    });

    test('togglePostCommentFormAction', () => {
        theStore.dispatch(togglePostCommentFormAction(true));
        result = theStore.getState();

        expect(result.detailPage.showPostCommentForm).toBeTruthy();
    });

    test('logoutCompleteAction', () => {
        theStore.dispatch(togglePostCommentFormAction(true));

        theStore.dispatch(logoutCompleteAction());
        result = theStore.getState();

        expect(result.detailPage.showPostCommentForm).toBeFalsy();
    });

    test('resetPromptLoginAction', () => {
        theStore.dispatch(togglePostCommentFormAction(true));

        theStore.dispatch(resetPromptLoginAction());
        result = theStore.getState();

        expect(result.detailPage.showPostCommentForm).toBeFalsy();
    });
});
