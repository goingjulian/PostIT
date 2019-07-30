import {resetStoreAction, theStore} from "../../index";
import {promptLoginAction} from "../../actions/authentication.actions";
import {
    addOrgSuccessAction,
    nextStageAction,
    prevStageAction,
    setOrgNameValidAction,
    setStageAction,
    setValueAction,
    setImgValueAction,
    setImgUploadingAction,
    resetImgUploadingAction
} from "../../actions/createOrganisation.actions";

describe('ReducerCreateOrganisation tests', () => {
    let expected = null;
    let result = null;

    beforeEach(async () => {
        expected = null;
        result = null;
        theStore.dispatch(resetStoreAction());
    });

    test('nextStageAction', () => {
        theStore.dispatch(nextStageAction())
        result = theStore.getState();
        expect(result.createOrganisation.stage).toEqual(1);
    });

    test('prevStageAction should decrease state by 1', () => {
        theStore.dispatch(nextStageAction());
        theStore.dispatch(prevStageAction());
        result = theStore.getState();
        expect(result.createOrganisation.stage).toEqual(0);
    });

    test('prevStageAction while in stage 0 should not decrease state by 1', () => {
        theStore.dispatch(prevStageAction());
        result = theStore.getState();
        expect(result.createOrganisation.stage).toEqual(0);
    });

    test('Stage is set to gien value (setStageAction)', () => {
        theStore.dispatch(setStageAction(2));
        result = theStore.getState();
        expect(result.createOrganisation.stage).toEqual(2);

    });

    test('Normal input field value is set (setValueAction)', () => {
        theStore.dispatch(setValueAction('email', 'test@domain.com'));
        result = theStore.getState();
        expect(result.createOrganisation.values.email).toEqual('test@domain.com');
    });

    test('Allowedmaildomains value is set (setValueAction)', () => {
        theStore.dispatch(setValueAction('allowedMailDomains', 'domain.com'));
        theStore.dispatch(setValueAction('allowedMailDomains', 'otherdomain.com'));
        result = theStore.getState();
        expect(result.createOrganisation.values.allowedMailDomains[0]).toEqual('domain.com');
        expect(result.createOrganisation.values.allowedMailDomains[1]).toEqual('otherdomain.com');
        expect(result.createOrganisation.values.allowedMailDomains.length).toEqual(2);
        expect(result.createOrganisation.values.emailDomain).toEqual('domain.com');
    });

    test('setImgValueAction', () => {
        theStore.dispatch(setImgValueAction('logoImg', 'img-name.jpg'));
        result = theStore.getState();
        expect(result.createOrganisation.values.logoImg.value).toEqual('img-name.jpg');
        expect(result.createOrganisation.values.logoImg.uploading).toEqual(false);
    });

    test('setImgUploadingAction', () => {
        result = theStore.getState();
        expect(result.createOrganisation.values.logoImg.uploading).toEqual(false);
        theStore.dispatch(setImgUploadingAction('logoImg'));
        result = theStore.getState();
        expect(result.createOrganisation.values.logoImg.uploading).toEqual(true);
    });

    test('resetImgUploadingAction', () => {
        result = theStore.getState();
        expect(result.createOrganisation.values.logoImg.uploading).toEqual(false);
        theStore.dispatch(setImgUploadingAction('logoImg'));
        result = theStore.getState();
        expect(result.createOrganisation.values.logoImg.uploading).toEqual(true);

        theStore.dispatch(resetImgUploadingAction('logoImg'));
        result = theStore.getState();
        expect(result.createOrganisation.values.logoImg.uploading).toEqual(false);
    });

    test('setOrgNameValidAction', () => {
        theStore.dispatch(setOrgNameValidAction(true));
        result = theStore.getState();
        expect(result.createOrganisation.orgNameValid).toBeTruthy();

    });

    test('addOrgSuccessAction', () => {
        theStore.dispatch(addOrgSuccessAction());
        result = {...theStore.getState()};
        expect(result.createOrganisation.orgAdded).toBeTruthy();

        result.createOrganisation.orgNameValid = false;
        expect(result.createOrganisation).toStrictEqual(theStore.getState().createOrganisation);

    });
});