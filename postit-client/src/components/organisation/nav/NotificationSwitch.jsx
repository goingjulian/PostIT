import React, {useEffect, useState} from 'react';
import * as ReactRedux from "react-redux";

import {
    addSubscriptionAction,
    removeSubscriptionAction,
    setSubscribedAction
} from "../../../actions/notification.actions";

function NotificationSwitch(props) {
    const [checked, setChecked] = useState({checked: true});
    const {excludedOrgNotifications, organisation, subscribed, permission, setSubscribedAction, addSubscriptionAction} = props;

    useEffect(() => {
        if (excludedOrgNotifications) {
            if (excludedOrgNotifications.includes(organisation.organisationName)) {
                setChecked(false);
            } else {
                setChecked(true);
            }
            if (!subscribed && permission && !excludedOrgNotifications.includes(organisation.organisationName)) {
                setSubscribedAction();
                addSubscriptionAction(organisation.organisationName);
            }
        }
    }, [excludedOrgNotifications, organisation, subscribed, permission, setSubscribedAction, addSubscriptionAction]);

    const handleClick = () => {
        setChecked(!checked);
        if (!checked) {
            props.addSubscriptionAction(props.organisation.organisationName);
        } else {
            props.removeSubscriptionAction(props.organisation.organisationName, props.sessionUid);
        }
    };

    return (
        <>
            <div className="notification-switch" onClick={handleClick}>
                <span className={`${checked ? '' : 'is-hidden'}`}><i
                    className='fas fa-bell fa-lg'/></span>
                <span className={`${checked ? 'is-hidden' : ''}`}><i
                    className='fas fa-bell-slash fa-lg'/></span>
                <span className="mobile-description description-icon-right">Toggle</span>
            </div>
        </>

    )

}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        sessionUid: state.authentication.sessionUid,
        excludedOrgNotifications: state.notification.excludedOrgNotifications,
        user: state.authentication.user,
        permission: state.notification.permission,
        subscribed: state.notification.subscribed
    };
}

function mapDispatchToProps(dispatch) {
    return {
        addSubscriptionAction: (organisation) => dispatch(addSubscriptionAction(organisation)),
        removeSubscriptionAction: (organisation, sessionUid) => dispatch(removeSubscriptionAction(organisation, sessionUid)),
        setSubscribedAction: () => dispatch(setSubscribedAction())
    }
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(NotificationSwitch);
