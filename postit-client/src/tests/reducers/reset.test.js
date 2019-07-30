import {resetStoreAction, theStore} from "../../index";
import {reducerAuthentication} from "../../reducers/reducerAuthentication";
import {testAction} from "../../reducers/reducerTest";

describe('StoreAction tests', () => {

    beforeEach(async () => {
        theStore.dispatch(resetStoreAction());
    });

    test('testAction ', () => {
        const expected = 'test'
        theStore.dispatch(testAction(expected));

        const result = theStore.getState();
        expect(result.test.testValue).toBe(expected);
    });

    test('resetStoreAction ', () => {
        const result = theStore.getState();
        theStore.dispatch(testAction('test'));
        expect(theStore.getState()).not.toStrictEqual(!result);

        theStore.dispatch(resetStoreAction());
        expect(theStore.getState()).toStrictEqual(result);
    });
});
