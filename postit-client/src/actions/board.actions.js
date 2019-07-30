export function addBoardRequestAction(screen,ideaId) {
    return {type: "NEW_REQUEST",screen,ideaId};
}

export function deleteBoardRequestAction(screen,ideaId) {
    return {type: "DELETE_REQUEST",screen,ideaId};
}

