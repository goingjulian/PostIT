import React from 'react';
import { CONN_URL } from '../../index';

import { Redirect, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';

import WaitForMail from '../shared/WaitForMail';
import CreateOrgForm from './CreateOrgForm';
import ProtectedRoute from '../shared/ProtectedRoute';

export default function HomePage(props) {
    return <section className="all-center">
        <img src={`${CONN_URL}/assets/logo.png`} alt="PostIT logo" />
        <h1 className="title">Share your ideas with your colleagues</h1>
        <p className="subtitle">PostIt offers an interactive way of sharing ideas throughout an organisation. Create your own organisations page today and explore the many features that PostIT has to offer</p>

        <img id="ipadImg" src="/media/images/ipad.png" alt="iPad with PostIT" />

        <div id="addOrgForm" className="box">
            <Switch>
                <Route exact path="/home" component={CreateOrgForm} />
                <ProtectedRoute exact path={`/home/success`} component={WaitForMail} isAllowed={useSelector(state => state.createOrganisation.orgAdded)} redirect={`/`} />
                <Redirect to="/error" />
            </Switch>
        </div>
    </section>
}