import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as ReactRedux from "react-redux";

import Loader from '../shared/Loader';
import Authentication from './login/Authentication';
import Websocket from "react-websocket";
import VerifyMail from './verify/VerifyMail';
import ProfilePage from './profile/ProfilePage';
import Nav from "./nav/Nav";
import IdeasOverview from './ideas/IdeasOverview';
import Detail from "./ideas/Detail";
import Board from "./board/Board";
import ProtectedRoute from '../shared/ProtectedRoute';

import { getOrganisationAction, restoreSessionAction } from '../../actions/authentication.actions';
import { SERVER_PROTOCOL, SERVER_PORT, SERVER_URL } from "../../index";
import { fetchIdeaForOrganisationAction, fetchIdeasForOrganisationAction } from "../../actions/ideas.actions";
import { addBoardRequestAction } from "../../actions/board.actions";
import { requestPermissionAction, setExcludedOrgNotificationsAction } from "../../actions/notification.actions";

class Organisation extends Component {

    constructor(props) {
        super(props);
        this.excludedURLs = [
            { url: this.props.match.params.organisation, nav: true, loader: false },
            { url: this.props.match.params.organisation + '/verify', nav: false, loader: false },
            { url: this.props.match.params.organisation + '/board', nav: false, loader: false },
            { url: this.props.match.params.organisation + '/login', nav: false, loader: true }
        ];
        this.showLoader = true;
        this.showNav = true;
    }

    determineNavAndLoader(props) {
        this.showLoader = true;
        this.showNav = true;

        for (let excluded of this.excludedURLs) {
            const re = new RegExp(`/${excluded.url}/?$`);
            if (re.test(props.location.pathname) && !excluded.nav) this.showNav = false;
            if (re.test(props.location.pathname) && !excluded.loader) this.showLoader = false;
        }
    }
    componentWillReceiveProps(newProps) {
        this.determineNavAndLoader(newProps);
    }

    componentWillMount() {
        this.determineNavAndLoader(this.props);
        this.props.getOrganisationAction(this.props.match.params.organisation, this.props.history);
        this.props.restoreSessionAction(this.props.match.params.organisation);
        // this.props.requestPermissionAction();
    }

    handleMessage = async data => {
        const message = JSON.parse(data);
        switch (message.type) {
            case 'UPVOTE_IDEA':
            case 'UPVOTE_COMMENT':
                await this.props.fetchIdeaForOrganisationAction(this.props.organisation.organisationName, message.payload.ideaId);
                break;
            case 'ADD_IDEA':
                await this.props.fetchIdeaForOrganisationAction(this.props.organisation.organisationName, message.payload.ideaId);
                await this.props.addBoardRequestAction(message.type, message.payload.ideaId);
                break;
            case 'ADD_COMMENT':
                await this.props.fetchIdeaForOrganisationAction(this.props.organisation.organisationName, message.payload.ideaId);
                await this.props.addBoardRequestAction(message.type, message.payload.ideaId);
                break;
            case 'EMPLOYEE_UPDATE':
                await this.props.fetchIdeasForOrganisationAction(this.props.organisation.organisationName);
                break;
            case 'NEW_EXCLUDED_NOTIFICATIONS':
                await this.props.setExcludedOrgNotificationsAction(message.payload.excludedOrgNotifications);
                break;
            default:
                console.error('Received a non-implemented websocket message');
        }
    };

    render() {
        if (!this.props.organisation || !this.props.sessionRestoreCompleted) return this.showLoader ? <Loader subtitle="Loading..." /> : null;

        const baseURL = `/${this.props.organisation.organisationName}`;

        return <>
            <Websocket
                url={`${SERVER_PROTOCOL === 'https' ? 'wss' : 'ws'}://${SERVER_URL}:${SERVER_PORT}/${this.props.organisation.organisationName}`}
                onOpen={() => console.info('Established connection to the WebSocket server')}
                onClose={() => console.info(`Connection to the WebSocket server has been lost`)}
                onMessage={this.handleMessage} ref={Websocket => {
                    this.refWebSocket = Websocket;
                }} />

            {this.showNav ? <Nav history={this.props.history} /> : null}

            <Switch>
                <ProtectedRoute path={`${baseURL}/login`}
                    component={Authentication} isAllowed={!this.props.user}
                    redirect={`${baseURL}/`} />

                <ProtectedRoute path={`${baseURL}/profile`}
                    component={ProfilePage} isAllowed={this.props.user}
                    redirect={`${baseURL}/`} />
                <Route path={`${baseURL}/verify/:token`} component={VerifyMail} />
                <Route exact path={`${baseURL}/`} component={IdeasOverview} />
                <Route exact path={`${baseURL}/board`} component={Board} />
                <Route exact path={`${baseURL}/idea/:ideaId`} component={Detail} />
                <Redirect to="/error" />
            </Switch>
        </>
    }
}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        loginRequired: state.authentication.loginRequired,
        user: state.authentication.user,
        initDone: state.notification.initDone,
        sessionRestoreCompleted: state.authentication.sessionRestoreCompleted
    };
}

function mapDispatchToProps(dispatch) {
    return {
        restoreSessionAction: (organisation) => dispatch(restoreSessionAction(organisation)),
        getOrganisationAction: (organisation, history) => dispatch(getOrganisationAction(organisation, history)),
        fetchIdeaForOrganisationAction: (organisation, ideaId) => dispatch(fetchIdeaForOrganisationAction(organisation, ideaId)),
        addBoardRequestAction: (screen, ideaId) => dispatch(addBoardRequestAction(screen, ideaId)),
        fetchIdeasForOrganisationAction: (organisation) => dispatch(fetchIdeasForOrganisationAction(organisation)),
        requestPermissionAction: () => dispatch(requestPermissionAction()),
        setExcludedOrgNotificationsAction: (excludedOrgNotifications) => dispatch(setExcludedOrgNotificationsAction(excludedOrgNotifications)),
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Organisation);