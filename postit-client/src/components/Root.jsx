import React from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import HomePage from './home/HomePage';
import Organisation from './organisation/Organisation';
import ErrorPage from './error/ErrorPage';
import Notification from "./Notification";

function Main(props) {
    return (
        <div className="App">
            <Switch>
                <Route path="/home" component={HomePage} />
                <Route exact path="/error" component={ErrorPage} />
                <Route path="/:organisation" component={Organisation} />
                <Redirect exact from="/" to="/home" />
                <Redirect to="/error" />
            </Switch>
            <Notification />
        </div>
    )
}
export default withRouter(Main);
