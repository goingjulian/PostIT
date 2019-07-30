const initialState = {
    ideas: null,
    createIdeaField: false,
    errorMessageIdeaList: false,
    errorMessageDetailPage: false,
    errorMessageIdeaAdded: false,
    errorMessageUpvote: false
};

export function reducerIdeasOverview(state = initialState, action) {
    switch (action.type) {
        case 'TOGGLE_CREATE_IDEA_FORM':
            return {...state, createIdeaField: action.value};
        case 'NEW_IDEAS_FETCHED':
            return {...state, ideas: action.value, errorMessage: false};
        case 'NO_IDEAS_FOUND' :
            return {...state, errorMessageIdeaList: action.errorMessage};
        case 'NO_IDEA_FOUND' :
            return {...state, errorMessageDetailPage: action.errorMessage};
        case 'NEW_IDEA_ADDED' :
            if(!state.ideas){state.ideas = []};
            return {...state, ideas: state.ideas.concat(action.idea), errorMessageIdeaList: false};
        case 'NEW_IDEA_ERROR' :
            return {...state, errorMessageIdeaAdded: action.errorMessage};
        case 'CLEAR_ERROR':
            return {...state, errorMessageIdeaAdded: false};
        case 'UPDATE_IDEA':
            let newIdeas = [];
            if(state.ideas !== null) newIdeas = [...state.ideas];
            const key = newIdeas.indexOf(newIdeas.find((idea) => idea._id === action.idea._id));
            if (key === -1) {
                newIdeas.push(action.idea);
            } else {
                newIdeas[key] = action.idea;
            }
            return {...state, ideas: newIdeas};
        case 'LOGOUT':
            return {
                ...state,
                createIdeaField: false,
                errorMessageIdeaAdded: false,
            };
        case 'RESET_LOGIN_REQUIRED':
            return {...state, createIdeaField: false};
        default:
            return state;
    }
}
