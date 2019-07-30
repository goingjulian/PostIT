import React, {Component}from 'react';
import posed, { PoseGroup } from "react-pose/lib/index";

import { hideNotificationAction } from "../actions/notification.actions";
import * as ReactRedux from "react-redux";

const AnimatedNotification = posed.div({
    enter: {
        y: 0,
        opacity: 1,
        delay: 300,
        transition: {
            y: { type: 'spring', stiffness: 1000, damping: 15 },
            default: { duration: 300 }
        }
    },
    exit: {
        y: 50,
        opacity: 0,
        transition: { duration: 150 }
    }
});

class Notification extends Component {
    render() {
        return (
            <div className="notifications-container">
                <PoseGroup>
                    {
                        this.props.notifications.map((notification, index) => {
                            return <AnimatedNotification className={`notification is-${notification.type}`} key={index}>
                                <button className="delete" onClick={() => this.props.hideNotificationAction(notification.notificationText)}/>
                                {notification.notificationText}
                            </AnimatedNotification>
                        })
                    }
                </PoseGroup>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        notifications: state.notification.notifications
    };
}

function mapDispatchToProps(dispatch) {
    return {
        hideNotificationAction: (notificationText) => dispatch(hideNotificationAction(notificationText))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Notification);