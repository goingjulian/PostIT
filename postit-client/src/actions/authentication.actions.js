import { CONN_URL, ENV } from "../index";
import { setExcludedOrgNotificationsAction, setNotificationTextAction } from "./notification.actions";

export function verifyRegisterStatusAction(organisation, email) {
    const options = {
        method: 'GET',
        credentials: ENV === 'dev' ? 'include' : 'same-origin'
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/auth/employees/${email}`, options);
            if (response.status === 404) return dispatch(registrationRequiredAction());

            if (!response.ok) throw new Error();
            dispatch(waitForMailAction());
            dispatch(loginAction(organisation, email));
        } catch (err) {
            dispatch(setNotificationTextAction("An error occured while trying to verify the e-mail address"));
        }
    }
}

export function loginAction(organisation, email) {
    const options = {
        method: 'PUT',
        credentials: ENV === 'dev' ? 'include' : 'same-origin'
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/auth/employees/${email}`, options);
            if (!response.ok) throw new Error();
        } catch (e) {
            dispatch(setNotificationTextAction("An error occured while trying to verify the e-mail address"));
        }
    }
}

export function registrationAction(organisation, email, firstName, lastName, position) {
    const options = {
        method: 'POST',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstName,
            lastName,
            position,
            email
        })
    };

    return async (dispatch) => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/auth/employees`, options);
            if (!response.ok) throw new Error();
            dispatch(waitForMailAction());
        } catch (err) {
            dispatch(setNotificationTextAction("An error occured while trying to submit the provided registration details"));
        }
    }
}

export function verifyMailAction(organisation, token) {
    const options = {
        method: 'PUT',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            token
        })
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/auth/employees/verify`, options);

            if (!response.ok) throw new Error('Error during fetch');
            const body = await response.json();
            dispatch(loginCompleteAction(body));
        } catch (err) {
            dispatch(tokenErrorAction());
        }
    }
}

export function logoutAction(organisation) {
    const options = {
        method: 'DELETE',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: {
            "Content-Type": "application/json",
        }
    };

    return async dispatch => {
        try {
            await fetch(`${CONN_URL}/organisations/${organisation}/auth/logout`, options);
            dispatch(logoutCompleteAction());
        } catch (e) {
            dispatch(setNotificationTextAction("An error occured while trying to log out"));
        }
    }
}

export function restoreSessionAction(organisation) {
    const options = {
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
    };

    return async dispatch => {
        let employee;
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/auth/session`, options);
            employee = await response.json();
            if (!response.ok) throw new Error("Session not found");

            dispatch(setExcludedOrgNotificationsAction(employee.excludedOrgNotifications));

            delete employee.excludedOrgNotifications;
            dispatch(loginCompleteAction(employee));
        } catch (err) {
            if (employee !== undefined) {
                dispatch(sessionErrorAction(employee.sessionUid));
                dispatch(setExcludedOrgNotificationsAction(employee.excludedOrgNotifications));
            }
        }
    }
}

export function getOrganisationAction(organisation, history) {
    const options = {
        credentials: ENV === 'dev' ? 'include' : 'same-origin'
    };

    return async dispatch => {
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}`, options);
            if (!response.ok) throw new Error('No organisation found');
            const organisationRes = await response.json();
            dispatch(setOrgAction(organisationRes));
        } catch (err) {
            history.push('/error');
        }
    }
}

export function updateEmployeeWithPicAction(organisation, values) {
    const formData = new FormData();
    formData.append('image', values.profilePic);

    const options = {
        method: 'PUT',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        body: formData
    };
    return async dispatch => {
        dispatch(setProfileUpdatingAction(true));
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/employees/profilePic`, options);
            if (!response.ok) throw new Error();
            const body = await response.json();

            const newValues = { ...values, profilePic: body.fileName };

            dispatch(updateEmployeeAction(organisation, newValues));
        } catch (e) {
            dispatch(setNotificationTextAction("An error occured while trying to update the employee details"));
            dispatch(setProfileUpdatingAction(false));
        }
    }
}

export function updateEmployeeAction(organisation, employee) {
    const options = {
        method: 'PUT',
        credentials: ENV === 'dev' ? 'include' : 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee)
    };
    return async dispatch => {
        dispatch(setProfileUpdatingAction(true));
        try {
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/employees`, options);
            if (!response.ok) throw new Error();
            const user = await response.json();
            dispatch(setProfileUpdatingAction(false));
            dispatch(setNotificationTextAction("Successfully updated employee details", 'success'));
            dispatch(updateUserAction(user));
        } catch (e) {
            dispatch(setNotificationTextAction("An error occured while trying to update the employee details"));
            dispatch(setProfileUpdatingAction(false));
        }
    }
}

export function setProfileUpdatingAction(profileUpdating) {
    return { type: 'SET_PROFILE_UPDATING', profileUpdating };
}

export function goBackToLoginAction() {
    return { type: 'RETURN_TO_LOGIN' };
}

export function waitForMailAction() {
    return { type: "WAIT_FOR_MAIL" };
}

export function registrationRequiredAction() {
    return { type: "REG_REQUIRED" };
}

export function setOrgAction(organisation) {
    return { type: "SET_ORG", organisation: organisation }
}

export function logoutCompleteAction() {
    return { type: "LOGOUT" }
}

export function sessionErrorAction(sessionUid) {
    return { type: "SESSION_ERROR", sessionUid }
}

export function loginCompleteAction(userDetails) {
    return { type: "LOGIN", userDetails }
}

export function promptLoginAction() {
    return { type: 'LOGIN_REQUIRED' };
}

export function resetPromptLoginAction() {
    return { type: 'RESET_LOGIN_REQUIRED' };
}

export function tokenErrorAction() {
    return { type: 'TOKEN_ERROR' };
}

export function resetTokenErrorAction() {
    return { type: 'RESET_TOKEN_ERROR' };
}

export function updateUserAction(user) {
    return { type: 'UPDATE_USER', user };
}
