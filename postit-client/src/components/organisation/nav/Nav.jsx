import React, {useState} from 'react';
import {Link} from "react-router-dom";
import * as ReactRedux from "react-redux";
import {logoutAction, promptLoginAction} from "../../../actions/authentication.actions";
import NotificationSwitch from "./NotificationSwitch";
import Avatar from '../../shared/Avatar';

function Nav(props) {
    const [menuActive, setMenuActive] = useState();
    const styleClass = menuActive ? 'is-active' : null;
    return (
        <nav className="navbar is-fixed-top " id="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <Link className="navbar-item" to={`/${props.organisation.organisationName}/`}>
                    <img src={props.organisation.logoImg} alt="logo"/>
                </Link>
                <span role="button" className={`navbar-burger burger ${styleClass}`}
                      onClick={() => setMenuActive(!menuActive)} aria-label="menu" aria-expanded="false"
                      data-target="navbarBasicExample">
                    <span aria-hidden="true"/>
                    <span aria-hidden="true"/>
                    <span aria-hidden="true"/>
                </span>
            </div>
            <div id="navbar" className={`navbar-menu ${styleClass}`}>
                <div className="navbar-start">

                    <Link className="navbar-item" to={`/${props.organisation.organisationName}/`}>
                        <span className="home-icon"><i className="fas fa-home fa-lg"/></span> Home
                    </Link>

                </div>
                <div className="navbar-end">
                    <Link to={`/${props.organisation.organisationName}/board`} className="navbar-item">
                        <i className="fas fa-tv fa-lg"/><span
                        className="mobile-description description-icon-right">Board</span>
                    </Link>
                    {props.permission ? <div className="navbar-item onclick"><NotificationSwitch/></div> : null}

                    {props.user !== null ?
                        <>
                            <Link to={`/${props.organisation.organisationName}/profile`} className="navbar-item">
                                <span className="icon user">
                                    <Avatar imgURL={props.user.profilePic} location={'nav'}/>
                                </span>
                                <h1 className="user">{props.user.firstName} {props.user.lastName}</h1>
                            </Link>
                            <div className="navbar-item"
                                 onClick={() => props.doLogout(props.organisation.organisationName, props.history)}>
                                <span className="mobile-description description-icon-left">Sign out</span><i
                                className="fas fa-sign-out-alt fa-lg"/>
                            </div>
                        </> :
                        <Link to={`/${props.organisation.organisationName}/login`} className="navbar-item"
                              onClick={() => props.promptLogin()}>
                            <span className="mobile-description description-icon-left">Sign in</span><i
                            className="fas fa-sign-in-alt fa-lg"/>
                        </Link>
                    }
                </div>
            </div>
        </nav>
    );
}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        user: state.authentication.user,
        permission: state.notification.permission
    }
}

function mapDispatchToProps(dispatch) {
    return {
        doLogout: (organisation, history) => dispatch((logoutAction(organisation, history))),
        promptLogin: () => dispatch(promptLoginAction())
    }
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Nav);
