import { CONN_URL, APP_SERVER_KEY } from "../index"

export function setNotificationTextAction(notificationText, notificationType = 'danger') {
    return (dispatch) => {
        dispatch({ type: 'NEW_NOTIFICATION_TEXT', notificationText, notificationType });
        setTimeout(() => {
            dispatch(hideNotificationAction(notificationText));
        }, 5000);
    }
}

export function setExcludedOrgNotificationsAction(excludedOrgNotifications) {
    return { type: 'EXCLUDED_ORG_NOTIFICATIONS', excludedOrgNotifications };
}

export function hideNotificationAction(notificationText) {
    return { type: 'HIDE_NOTIFICATION', notificationText };
}

export function setPermissionAction(permission) {
    return { type: 'SET_PERMISSION', permission };
}

export function setSubscribedAction() {
    return { type: 'SET_SUBSCRIBED', subscribed: true };
}

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function addSubscriptionAction(organisation) {
    return async (dispatch) => {
        try {
            if (window.Notification.permission === "granted") {
                const subscription = await createSubscription();
                const options = {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscription)
                };
                const response = await fetch(`${CONN_URL}/organisations/${organisation}/shared/notifications`, options);
                if (!response.ok) throw Error();
                const result = await response.json();
                dispatch(setExcludedOrgNotificationsAction(result.excludedOrgNotifications));
            }
        } catch (e) {
            dispatch(setNotificationTextAction("There was a problem enabling notifications"));
        }
    }
}

export function removeSubscriptionAction(organisation, sessionUid) {
    return async (dispatch) => {
        try {
            const options = {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const response = await fetch(`${CONN_URL}/organisations/${organisation}/shared/notifications/${sessionUid}`, options);
            if (!response.ok) throw Error();
            const result = await response.json();
            dispatch(setExcludedOrgNotificationsAction(result.excludedOrgNotifications));
        } catch (e) {
            dispatch(setNotificationTextAction("There was a problem disabling notifications"));
        }
    }
}

async function createSubscription() {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    let pushSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (pushSubscription === undefined || pushSubscription === null) {
        const options = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(APP_SERVER_KEY)
        };
        pushSubscription = await serviceWorkerRegistration.pushManager.subscribe(options);
    }
    return pushSubscription;
}

export function requestPermissionAction() {
    return (dispatch) => {
        if (!("Notification" in window)) {
            return { type: "NOT_SUPPORTED" };
        }

        if ('safari' in window && 'pushNotification' in window.safari) {
            return { type: "NOT_SUPPORTED" };
        }

        window.Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                dispatch(setPermissionAction(true));
            }
        }).catch(e => {
            dispatch(setNotificationTextAction("There was a problem requesting permission for notifications"))
        })
    }
}
