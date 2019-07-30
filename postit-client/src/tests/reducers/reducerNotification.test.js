import {resetStoreAction, theStore} from "../../index";
import {
    setNotificationTextAction,
    hideNotificationAction,
    setExcludedOrgNotificationsAction, setSubscribedAction, setPermissionAction
} from "../../actions/notification.actions";


describe('reducerNotification tests', () => {
    let expected = null;
    let result = null;
    const notification = {notificationText: "This is a new notification", type: 'danger'};

    beforeEach(async () => {
        expected = null;
        result = null;
        theStore.dispatch(resetStoreAction());
    });

    test('setNotificationTextAction', () => {
        expected = [notification];

        theStore.dispatch(setNotificationTextAction(notification.notificationText));
        result = theStore.getState();

        expect(result.notification.notifications).toEqual(expected);
        expect(result.notification.notifications[0]).toEqual(notification);
        expect(result.notification.notifications.length).toEqual(1);
    });

    test('setNotificationTextAction with same text cannot be added twice', () => {
        expected = [notification];

        theStore.dispatch(setNotificationTextAction(notification.notificationText));
        theStore.dispatch(setNotificationTextAction(notification.notificationText));
        result = theStore.getState();

        expect(result.notification.notifications).toEqual(expected);
        expect(result.notification.notifications[0]).toEqual(notification);
        expect(result.notification.notifications.length).toEqual(1);
    });

    test('hideNotificationAction', () => {
        expected = [];

        theStore.dispatch(hideNotificationAction(notification.notificationText));
        result = theStore.getState();

        expect(result.notification.notifications).toEqual(expected);
        expect(result.notification.notifications.length).toEqual(0);
    })

    test('hideNotificationAction', () => {
        expected = [];

        theStore.dispatch(hideNotificationAction(notification.notificationText));
        result = theStore.getState();

        expect(result.notification.notifications).toEqual(expected);
        expect(result.notification.notifications.length).toEqual(0);
    })

    test('setExcludedOrgNotificationsAction', () => {

        theStore.dispatch(setExcludedOrgNotificationsAction(true));
        result = theStore.getState();

        expect(result.notification.notifications).toBeTruthy;
    })

    test('setExcludedOrgNotificationsAction', () => {

        theStore.dispatch(setExcludedOrgNotificationsAction(true));
        result = theStore.getState();

        expect(result.notification.notifications).toBeTruthy;
    })

    test('setPermissionAction', () => {

        theStore.dispatch(setPermissionAction (true));
        result = theStore.getState();

        expect(result.notification.notifications).toBeTruthy;
    })

    test('setSubscribedAction', () => {

        theStore.dispatch(setSubscribedAction());
        result = theStore.getState();

        expect(result.notification.notifications).toBeTruthy;
    })





});
