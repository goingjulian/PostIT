const initialState = {
    default: {screen: "DEFAULT"},
    requests: [],
};

export function reducerBoard(state = initialState, action) {
    switch (action.type) {
        case 'NEW_REQUEST':
            return {...state, requests: state.requests.concat({ideaId: action.ideaId, screen: action.screen})};
        case 'DELETE_REQUEST':
            const newRequest = [...state.requests];
            const indexToRemove = state.requests.indexOf(newRequest.find((request) => request.ideaId === action.ideaId));
            return {...state, requests: [...newRequest.slice(0, indexToRemove), ...newRequest.slice(indexToRemove + 1)]};
        default:
            return state;
    }
}
