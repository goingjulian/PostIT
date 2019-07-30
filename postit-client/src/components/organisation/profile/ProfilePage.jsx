import React from 'react';
import * as ReactRedux from 'react-redux';

import ProfileForm from './ProfileForm';
import { capitalizeFirstLetter } from '../../../helpers/functions';

function ProfilePage(props) {
    return <section>
        <div id="profileUser" className="hero box">
            <figure className="image is-128x128 profile-128">
                <img className="is-rounded" src={props.user.profilePic ? `${props.user.profilePic}?randomizr=${new Date().getTime()}` : '/media/images/person.png'} alt="Profile" />
            </figure>
            <h1 className="title is-4">{props.user.firstName} {props.user.lastName}</h1>
            <h2 className="subtitle is-4">{props.user.position} at {capitalizeFirstLetter(props.organisation.organisationName)}</h2>
        </div>
        <hr />
        <div className="level">
            <div className="container all-center">
                <ProfileForm />
            </div>
        </div>
    </section>
}

function mapStateToProps(state) {
    return {
        user: state.authentication.user,
        organisation: state.authentication.organisation
    }
}

export default ReactRedux.connect(mapStateToProps)(ProfilePage);