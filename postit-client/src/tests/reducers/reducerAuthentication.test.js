import {resetStoreAction, theStore} from "../../index";
import {
    goBackToLoginAction,
    loginCompleteAction,
    logoutCompleteAction,
    promptLoginAction,
    registrationRequiredAction,
    resetPromptLoginAction,
    resetTokenErrorAction,
    sessionErrorAction,
    setOrgAction,
    setProfileUpdatingAction,
    tokenErrorAction,
    updateUserAction,
    waitForMailAction
} from "../../actions/authentication.actions";

describe('ReducerAuthentication tests', () => {
    let expected = null;
    let result = null;

    const user = {
        "_id": "5cebf7c7246ec7be529cc5d2",
        "email": "Kevin.mymail@gmail.com",
        "firstName": "Kevin",
        "lastName": "van Schaijk",
        "position": "Creative director",
        "sessionUid": "UsiyXXuc9T",
        "profilePic": null
    }

    const organisation = {
        "organisationName": "schiphol",
        "backgroundImg": "http://localhost:3010/img/schiphol-background.jpg",
        "logoImg": "http://localhost:3010/img/schiphol-logo.jpg",
        "allowedMailDomains": [
            "provider.com",
            "korfdegidts.nl",
            "gmail.com",
            "nickspijker.nl"
        ]
    }

    beforeEach(async () => {
        expected = null;
        result = null;
        theStore.dispatch(resetStoreAction());
    });

    test('promptLoginAction', () => {
        theStore.dispatch(promptLoginAction());
        result = theStore.getState();

        expect(result.authentication.loginRequired).toBeTruthy();
    });

    test('resetPromptLoginAction', () => {
        theStore.dispatch(promptLoginAction());
        theStore.dispatch(registrationRequiredAction());
        theStore.dispatch(waitForMailAction());

        theStore.dispatch(resetPromptLoginAction());
        result = theStore.getState();

        expect(result.authentication.loginRequired).toBeFalsy();
        expect(result.authentication.registrationRequired).toBeFalsy();
        expect(result.authentication.waitForMail).toBeFalsy();
    });

    test('loginCompleteAction', () => {
        theStore.dispatch(promptLoginAction());
        theStore.dispatch(registrationRequiredAction());
        theStore.dispatch(tokenErrorAction());
        theStore.dispatch(waitForMailAction());

        theStore.dispatch(loginCompleteAction(user));
        result = theStore.getState();

        expect(typeof result.authentication.user).toBe('object');
        expect(result.authentication.user).toEqual(user);
        expect(result.authentication.errorMessage).toBeNull();
        expect(result.authentication.loginRequired).toBeFalsy();
        expect(result.authentication.registrationRequired).toBeFalsy();
        expect(result.authentication.waitForMail).toBeFalsy();
        expect(result.authentication.tokenError).toBeFalsy();
        expect(result.authentication.sessionRestoreCompleted).toBeTruthy();
    });

    test('logoutCompleteAction', () => {
        theStore.dispatch(updateUserAction(user));
        theStore.dispatch(logoutCompleteAction());
        result = theStore.getState();

        expect(result.authentication.user).toBeNull();
    });

    test('setOrgAction', () => {
        theStore.dispatch(setOrgAction(organisation));
        result = theStore.getState();

        expect(result.authentication.organisation).toBeTruthy();
        expect(typeof result.authentication.organisation).toBe('object');
        expect(result.authentication.organisation).toEqual(organisation);
    });

    test('registrationRequiredAction', () => {
        theStore.dispatch(registrationRequiredAction());
        result = theStore.getState();

        expect(result.authentication.registrationRequired).toBeTruthy();
    });

    test('waitForMailAction', () => {
        theStore.dispatch(waitForMailAction());
        result = theStore.getState();

        expect(result.authentication.waitForMail).toBeTruthy();
    });

    test('tokenErrorAction', () => {
        theStore.dispatch(tokenErrorAction());
        result = theStore.getState();

        expect(result.authentication.tokenError).toBeTruthy();
    });

    test('resetTokenErrorAction', () => {
        theStore.dispatch(tokenErrorAction());
        theStore.dispatch(resetTokenErrorAction());
        result = theStore.getState();

        expect(result.authentication.tokenError).toBeFalsy();
    });

    test('sessionErrorAction', () => {
        theStore.dispatch(sessionErrorAction(user.sessionUid));
        result = theStore.getState();

        expect(result.authentication.sessionRestoreCompleted).toBeTruthy();
        expect(result.authentication.sessionUid).toBeTruthy();
        expect(result.authentication.sessionUid).toEqual(user.sessionUid);
    });

    test('goBackToLoginAction', () => {
        theStore.dispatch(registrationRequiredAction());
        theStore.dispatch(goBackToLoginAction());
        result = theStore.getState();

        expect(result.authentication.registrationRequired).toBeFalsy();
    });

    test('updateUserAction', () => {
        theStore.dispatch(updateUserAction(user));
        result = theStore.getState();

        expect(result.authentication.user).toBeTruthy();
        expect(typeof result.authentication.user).toBe('object');
        expect(result.authentication.user).toEqual(user);
    });

    test('setProfileUpdatingAction', () => {
        theStore.dispatch(setProfileUpdatingAction(true));
        result = theStore.getState();

        expect(result.authentication.profileUpdating).toBeTruthy();
    });
});
