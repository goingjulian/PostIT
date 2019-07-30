import React, { Component } from 'react';
import * as ReactRedux from "react-redux";
import { addCommentAction, togglePostCommentFormAction } from "../../../actions/ideas.actions";
import Avatar from "../../shared/Avatar";

class PostComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: '',
            disableCommentButton: true
        }
    }

    handleCommentChange(event) {
        this.setState({
            comment: event.target.value,
            disableCommentButton: true
        });

        if (event.target.value) {
            this.setState({
                disableCommentButton: false
            });
        }
    }

    submitComment() {
        this.props.togglePostCommentForm(false);
        this.props.addCommentAction(this.props.organisation.organisationName, this.props.ideaId, this.state.comment);
    }

    render() {
        return (
            <div className="media">
                <div className="media-left">
                    <Avatar imgURL={this.props.user.profilePic} />
                </div>
                <div className="media-content">
                    <div className="content">
                        <div>
                            <strong>{this.props.user.firstName} {this.props.user.lastName}</strong>
                            <small> {this.props.user.position}</small>
                            <div className="field">
                                <label className="label" />
                                <div className="control">
                                    <textarea
                                        className="textarea"
                                        autoComplete="off"
                                        placeholder="Type your comment in here..."
                                        value={this.state.comment}
                                        onChange={(e) => this.handleCommentChange(e)}
                                    />
                                </div>
                            </div>
                            <div className="field is-grouped">
                                <div className="control">
                                    <button className="button is-link" id="submit-comment-button" disabled={this.state.disableCommentButton} onClick={() => this.submitComment()}
                                    >Submit</button>
                                </div>
                                <div className="button is-text" onClick={() => this.props.togglePostCommentForm(false)}
                                >
                                    Cancel
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        user: state.authentication.user
    };
}

function mapDispatchToProps(dispatch) {
    return {
        togglePostCommentForm: (boolean) => dispatch(togglePostCommentFormAction(boolean)),
        addCommentAction: (organisation, ideaId, comment) => dispatch(addCommentAction(organisation, ideaId, comment))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(PostComment);
