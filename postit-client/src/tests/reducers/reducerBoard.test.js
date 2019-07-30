import {resetStoreAction, theStore} from "../../index";
import {addBoardRequestAction, deleteBoardRequestAction} from "../../actions/board.actions";


describe('ReducerBoard tests', () => {
    let expected = null;
    let result = null;

    const request1 = {screen: "ADD_IDEA", ideaId:1}
    const request2 = {screen: "ADD_IDEA", ideaId:1}

    beforeEach(async () => {
        expected = null;
        result = null;
        theStore.dispatch(resetStoreAction());
    });

    test('addBoardRequestAction', () => {

        theStore.dispatch(addBoardRequestAction(request1.screen, request1.ideaId));
        result = theStore.getState();

        expect(result.board.requests).toEqual([request1]);
        expect(result.board.requests[0]).toEqual(request1);
        expect(result.board.requests.length).toEqual(1);

        theStore.dispatch(addBoardRequestAction(request2.screen, request2.ideaId));
        result = theStore.getState();

        expect(result.board.requests).toEqual([request1,request2]);
        expect(result.board.requests[1]).toEqual(request2);
        expect(result.board.requests.length).toEqual(2);
    });

    test('deleteBoardRequestAction', () => {
        theStore.dispatch(addBoardRequestAction(request1.screen, request1.ideaId));
        theStore.dispatch(addBoardRequestAction(request2.screen, request2.ideaId));
        theStore.dispatch(deleteBoardRequestAction(request1.screen, request1.ideaId))

        result = theStore.getState();
        expect(result.board.requests).toEqual([request2]);
        expect(result.board.requests[0]).toEqual(request2);
        expect(result.board.requests.length).toEqual(1);
    });

});
