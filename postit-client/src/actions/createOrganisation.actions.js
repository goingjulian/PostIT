import { CONN_URL } from "../index";
import { setNotificationTextAction } from "./notification.actions";

export function checkOrganisationNameAvailableAction(organisation) {
    const options = {
        credentials: 'include'
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}`, options);
            if (response.status === 404) dispatch(setOrgNameValidAction(true));
            else if (response.status === 200) {
                dispatch(setOrgNameValidAction(false));
            }
            else throw new Error('No organisation found');
        } catch (err) {
            dispatch(setNotificationTextAction("An error occured while trying to contact the server"));
            dispatch(setOrgNameValidAction(false));
        }
    }
}

export function registerOrganisationAction(values, history) {
    const options = {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
    }
    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/`, options);
            if (!response.ok) throw new Error();

            dispatch(addOrgSuccessAction());
            history.push('/home/success');
            dispatch(setStageAction(0));
            dispatch(setOrgNameValidAction(false));
        } catch (err) {
            dispatch(setNotificationTextAction("An error occured while trying to add the new organisation"));
        }
    }
}

export function uploadImageAction(organisationName, role, key, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const options = {
        method: 'POST',
        body: formData
    }
    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisationName}/img?role=${role}`, options);
            if (!response.ok) throw new Error();
            const body = await response.json();
            dispatch(setImgValueAction(key, body.fileName));
        } catch (err) {
            dispatch(resetImgUploadingAction(key));
            dispatch(setNotificationTextAction("An error occured while trying to upload the image"));
        }
    }
}

export function addOrgSuccessAction() {
    return { type: 'ADD_ORG_SUCCESS' };
}

export function setImgValueAction(key, value) {
    return { type: 'SET_IMG_VALUE', key, value };
}

export function setImgUploadingAction(key) {
    return { type: 'SET_IMG_UPLOADING', key };
}

export function resetImgUploadingAction(key) {
    return { type: 'RESET_IMG_UPLOADING', key };
}

export function nextStageAction() {
    return { type: 'NEXT_STAGE' };
}

export function setStageAction(stage) {
    return { type: 'SET_STAGE', stage };
}

export function prevStageAction() {
    return { type: 'PREV_STAGE' };
}

export function setValueAction(key, value) {
    return { type: 'SET_VALUE', key, value };
}

export function setOrgNameValidAction(orgNameValid) {
    return { type: 'SET_ORG_NAME_VALID', orgNameValid };
}

export function removeItemFromMultiSelectAction(valueKey, itemIndex) {
    return { type: 'REMOVE_ITEM_MULTI_SELECT', valueKey, itemIndex }
}
