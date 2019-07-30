const initialState = {
    errorMessage: false,
    organisation: null,
    user: null,
    registrationRequired: false,
    waitForMail: false,
    tokenError: false,
    sessionUid: null,
    profileUpdating: false,
    sessionRestoreCompleted: false
};


export function reducerAuthentication(state = initialState, action) {
    let changes;
    switch (action.type) {
        case 'LOGIN_REQUIRED':
            return { ...state, loginRequired: true };
        case 'RESET_LOGIN_REQUIRED':
            return { ...state, loginRequired: false, registrationRequired: false, waitForMail: false };
        case 'LOGIN':
            changes = {
                user: action.userDetails,
                errorMessage: null,
                loginRequired: false,
                registrationRequired: false,
                waitForMail: false,
                tokenError: false,
                sessionRestoreCompleted: true,
                sessionUid: action.userDetails.sessionUid
            };
            return { ...state, ...changes };
        case 'LOGOUT':
            return { ...state, user: null };
        case 'SET_ORG':
            return { ...state, organisation: action.organisation };
        case 'REG_REQUIRED':
            return { ...state, registrationRequired: true };
        case 'WAIT_FOR_MAIL':
            return { ...state, waitForMail: true };
        case 'TOKEN_ERROR':
            return { ...state, tokenError: true };
        case 'RESET_TOKEN_ERROR':
            return { ...state, tokenError: false };
        case 'SESSION_ERROR':
            return { ...state, sessionUid: action.sessionUid, sessionRestoreCompleted: true };
        case 'RETURN_TO_LOGIN':
            return { ...state, registrationRequired: false };
        case 'UPDATE_USER':
            return { ...state, user: action.user };
        case 'SET_PROFILE_UPDATING':
            return { ...state, profileUpdating: action.profileUpdating };
        default:
            return state;
    }
}



