import React from 'react';
import * as ReactRedux from "react-redux";

import UpvoteButton from "./UpvoteButton";
import Avatar from "../../shared/Avatar";
import { upvoteCommentAction } from "../../../actions/ideas.actions";

function Comment(props) {
    return (
        <div className="box">
            <article className="media">
                <div className="media-left">
                    <Avatar imgURL={props.comment.authorProfPicURL} />
                </div>
                <div className="media-content">
                    <div className="content">
                        <p>
                            <strong>{props.comment.authorFirstName + ' ' + props.comment.authorLastName}</strong>
                            <small> {props.comment.authorPosition}</small>
                            <br />
                            {props.comment.comment}
                        </p>
                    </div>
                </div>
                {props.hideupvotes ? null :
                <UpvoteButton size="fa-2x" color="green" upvotes={props.comment.upvotes}
                    showUpvoteNumber={true}
                    sessionUid={props.sessionUid}
                    upvoteFunction={() => props.upvoteCommentAction(props.organisation.organisationName, props.ideaNumber, props.comment._id)} />
                }
            </article>
        </div>
    )
}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        user: state.authentication.user,
        sessionUid: state.authentication.sessionUid
    };
}

function mapDispatchToProps(dispatch) {
    return {
        upvoteCommentAction: (organisation, ideaNumber, commentNumber) => dispatch(upvoteCommentAction(organisation, ideaNumber, commentNumber))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Comment);
