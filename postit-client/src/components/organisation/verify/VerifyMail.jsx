import React from 'react';
import * as ReactRedux from 'react-redux';
import {Redirect} from 'react-router-dom';

import {resetTokenErrorAction, verifyMailAction} from '../../../actions/authentication.actions';
import {setNotificationTextAction} from '../../../actions/notification.actions';
import Loader from '../../shared/Loader';

class VerifyMail extends React.Component {
    componentWillMount() {
        const token = this.props.match.params.token;
        this.props.verifyMailAction(this.props.organisation.organisationName, token);
    }

    goBack() {
        this.props.resetTokenError();
        this.props.history.push(`/${this.props.organisation.organisationName}/`);
    }

    render() {
        if (this.props.tokenError) return <Redirect to="/error" />;
        else if (this.props.user === null) return <Loader subtitle="loading..."/>;
        else {
            this.props.setNotificationTextAction(`Successfully logged in`, 'info');
            return <Redirect to={`/${this.props.organisation.organisationName}/`} />;
        }
    }
}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        user: state.authentication.user,
        tokenError: state.authentication.tokenError
    }
}

function mapDispatchToProps(dispatch) {
    return {
        verifyMailAction: (organisation, token) => dispatch(verifyMailAction(organisation, token)),
        resetTokenError: () => dispatch(resetTokenErrorAction()),
        setNotificationTextAction: (notificationText, notificationType) => dispatch(setNotificationTextAction(notificationText, notificationType))
    }
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(VerifyMail);
