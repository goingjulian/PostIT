import React from 'react';
import * as ReactRedux from 'react-redux';

import AuthForm from './AuthForm';

function Authentication(props) {

    return (
        <section id="login">
            <div className="columns is-flex-mobile">
                <div
                    className="column flex-v-center has-text-centered is-full-mobile is-half-tablet is-half-desktop is-half-widescreen is-half-fullhd">
                    <div className="column
                        is-offset-3-fullhd is-half-fullhd
                        is-offset-3-widescreen is-half-widescreen
                        is-offset-3-desktop is-half-desktop
                        is-offset-2-tablet is-8-tablet">
                        <figure className="logo image">
                            <img src={props.organisation.logoImg} alt="logo"/>
                        </figure>
                        <AuthForm history={props.history}/>
                    </div>
                </div>
                <div
                    className="company-img column has-text-centered is-full-mobile is-half-tablet is-half-desktop is-half-widescreen is-half-fullhd"
                    style={{background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${props.organisation.backgroundImg}) no-repeat center center`}}>
                </div>
            </div>
        </section>
    )
}


function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
    }
}

export default ReactRedux.connect(mapStateToProps)(Authentication);
