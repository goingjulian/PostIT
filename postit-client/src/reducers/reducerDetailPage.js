const initialState = {
    showPostCommentForm: false,
};

export function reducerDetailPage(state = initialState, action) {
    switch (action.type) {
        case 'TOGGLE_POST_COMMENT_FORM':
            return { ...state, showPostCommentForm: action.value };
        case 'LOGOUT':
            return { ...state, showPostCommentForm: false };
        case 'RESET_LOGIN_REQUIRED':
            return { ...state, showPostCommentForm: false };
        default:
            return state;
    }
}
