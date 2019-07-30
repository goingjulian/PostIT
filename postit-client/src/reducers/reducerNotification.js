const initialState = {
    notifications: [],
    excludedOrgNotifications: null,
    permission : false,
    subscribed: false,
};

export function reducerNotification(state = initialState, action) {
    let notificationsCopy;
    switch (action.type) {
        case 'NEW_NOTIFICATION_TEXT':
            notificationsCopy = [...state.notifications];
            const notification = notificationsCopy.find(notification => notification.notificationText === action.notificationText);
            if (notification === undefined) {
                notificationsCopy.push({ notificationText: action.notificationText, type: action.notificationType });
            }
            return { ...state, notifications: notificationsCopy };
        case 'HIDE_NOTIFICATION':
            notificationsCopy = [...state.notifications];
            notificationsCopy.splice(notificationsCopy.indexOf(notificationsCopy.find(notification => notification.notificationText === action.notificationText)), 1);
            return { ...state, notifications: notificationsCopy };
        case 'EXCLUDED_ORG_NOTIFICATIONS':
            return { ...state, excludedOrgNotifications: action.excludedOrgNotifications };
        case 'SET_PERMISSION':
            return {...state, permission: action.permission};
        case 'SET_SUBSCRIBED':
            return {...state, subscribed: action.subscribed};
        default:
            return state;
    }
}