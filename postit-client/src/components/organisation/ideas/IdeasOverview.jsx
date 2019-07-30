import React, { useEffect } from 'react';
import * as ReactRedux from 'react-redux';

import IdeaList from './IdeaList';
import CreateIdea from './CreateIdea';
import { fetchIdeasForOrganisationAction } from "../../../actions/ideas.actions";

function IdeasOverview(props) {
    const organisationName = props.organisation.organisationName;
    const fetchIdeasForOrganisation = props.fetchIdeasForOrganisation;
    
    useEffect(() => {
        fetchIdeasForOrganisation(organisationName);
    }, [organisationName, fetchIdeasForOrganisation]);

    return <section id="overview" className={props.errorMessage ? 'error-container' : null}>
        <div className="container">
            {!props.errorMessage ?
                <IdeaList ideas={props.ideas}
                    organisationName={organisationName} /> :
                <>
                    <div>
                        <h3 className="title is-3 has-text-centered">{props.errorMessage}</h3>
                        <i className="fas fa-question-circle fa-10x"></i>
                    </div>
                    <p className="not-found"> Be the first to submit a idea! </p>
                </>
            }
            <CreateIdea overviewError={props.errorMessage} hasIdeas={props.ideas !== null ? props.ideas.length : false} />
        </div>
    </section>
}

function mapStateToProps(state) {
    return {
        ideas: state.ideasOverview.ideas,
        errorMessage: state.ideasOverview.errorMessageIdeaList,
        organisation: state.authentication.organisation
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchIdeasForOrganisation: (organisation) => dispatch(fetchIdeasForOrganisationAction(organisation))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(IdeasOverview);
