import React from 'react';
import * as ReactRedux from "react-redux";
import { Link } from "react-router-dom";

import { togglePostCommentFormAction, fetchIdeaForOrganisationAction } from "../../../actions/ideas.actions";
import { promptLoginAction } from '../../../actions/authentication.actions';

import Loader from '../../shared/Loader';
import PostComment from "./PostComment";
import CommentList from "./CommentList";
import Idea from "../../shared/Idea";
import AddButton from "../../shared/AddButton";

function Detail(props) {
    const currentIdeaShown = props.ideas !== null ? props.ideas.find((idea) => idea._id === props.match.params.ideaId) : null;

    if (currentIdeaShown === null) {
        props.fetchIdeaForOrganisationAction(props.organisation.organisationName, props.match.params.ideaId);
    }

    return (
        <section id="detail" className={`${props.errorMessage ? 'error-container' : null}`}>
            <div className="container has-text-centered">
                <Content currentIdeaShown={currentIdeaShown} {...props}/>
            </div>
        </section>
    );
}

function mapStateToProps(state) {
    return {
        ideas: state.ideasOverview.ideas,
        showPostCommentForm: state.detailPage.showPostCommentForm,
        organisation: state.authentication.organisation,
        user: state.authentication.user,
        errorMessage: state.ideasOverview.errorMessageDetailPage
    }
}

function mapDispatchToProps(dispatch) {
    return {
        togglePostCommentForm: (boolean) => dispatch(togglePostCommentFormAction(boolean)),
        fetchIdeaForOrganisationAction: (organisation, ideaId) => dispatch(fetchIdeaForOrganisationAction(organisation, ideaId)),
        promptLogin: () => dispatch(promptLoginAction())
    }
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Detail);

function ErrorPage(props) {
    return <>
        <div>
            <h3 className="title is-3 has-text-centered">{props.errorMessage}</h3>
            <i className="fas fa-question-circle fa-10x"></i>
        </div>
        <p className="not-found">{props.errorMessage}</p>
        <div className="column">
            <Link to={`/${props.organisation.organisationName}/`} className="button cta-green">
                <span>Check other ideas</span>
                <span className="icon is-small">
                    <i className="fas fa-arrow-right"></i>
                </span>
            </Link>
        </div>
    </>
}

function Content(props) {
    if (props.currentIdeaShown === null && props.errorMessage === false) return <Loader subtitle="Loading idea..." />;
    else if (props.currentIdeaShown === null && props.errorMessage) return <ErrorPage errorMessage={props.errorMessage} organisation={props.organisation} />;
    else return <>
        <Idea idea={props.currentIdeaShown} showAuthor showDescription upvotingEnabled/>

        {!props.showPostCommentForm ?
            <AddButton noContentError={props.errorMessage} hasContent={props.currentIdeaShown.comments} onClickAction={() => props.user ? props.togglePostCommentForm(true) : props.history.push(`/${props.organisation.organisationName}/login`)} />
            : <div className="columns">
                <div className="box column is-6 is-offset-3">
                    <PostComment ideaId={props.currentIdeaShown._id} />
                </div>
            </div>
        }
        <CommentList comments={props.currentIdeaShown.comments} ideaNumber={props.currentIdeaShown._id} />
    </>;
}
