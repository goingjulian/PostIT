import React from 'react';
import {Link} from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';

import UpvoteButton from '../organisation/ideas/UpvoteButton';
import Avatar from './Avatar';
import {upvoteIdeaAction} from "../../actions/ideas.actions";

export default function Idea(props) {
    const organisationName = useSelector(state => state.authentication.organisation.organisationName);
    const sessionUid = useSelector(state => state.authentication.sessionUid);
    const dispatch = useDispatch();

    return (
        <div className={`box ${props.upvoted ? 'upvoted' : null}`} id="idea">
            <div className="columns is-flex">

                {/*Column for pictures and icons*/}
                <div
                    className={`column is-1-fullhd is-1-widescreen column is-1-desktop is-1-tablet is-hidden-mobile ${props.idea.upvoteClass}`}
                    style={{backgroundImage: "url(/media/images/top.png)"}}></div>

                {/*Column for main content*/}
                <div
                    className="column is-10-fullhd is-10-widescreen column is-10-desktop is-10-tablet is-10-mobile">
                    {props.linkToDetail
                        ?
                        <Link to={`/${organisationName}/idea/${props.idea._id}`}>
                            <h1 className={`title is-size-3-widescreen is-size-3-fullhd is-size-3-desktop is-size-3-tablet is-size-5-mobile ${props.alignleft ? 'has-text-left' : 'is-center'} `}>{props.idea.title}</h1>
                        </Link>
                        :
                        <>
                            {props.upvoted ? <h2>Recently upvoted</h2> : null}
                            <h1 className="title is-size-3-widescreen is-size-3-fullhd is-size-3-desktop is-size-3-tablet is-size-5-mobile is-center">{props.idea.title}</h1>
                        </>
                    }

                    {props.showDescription ?
                        <div>
                            {props.linkToDetail
                                ?
                                <Link
                                    to={`/${organisationName}/idea/${props.idea._id}`}
                                    id="description-link">
                                    <p className={`idea-description ${props.alignleft ? 'has-text-left' : null}`}>
                                        {props.idea.description}
                                    </p>
                                </Link>
                                : <p className={`idea-description ${props.alignleft ? 'has-text-left' : null}`}>
                                    {props.idea.description}
                                </p>
                            }
                        </div> : null}
                </div>

                {/*Column for upvotes*/}
                <div className="column is-1-fullhd is-1-widescreen column is-1-desktop is-1-tablet is-2-mobile">
                    {props.upvotingEnabled ?
                        <UpvoteButton
                            sessionUid={sessionUid}
                            size="fa-2x"
                            upvotes={props.idea.upvotes}
                            upvoteFunction={() => dispatch(upvoteIdeaAction(organisationName, props.idea._id))}/>
                        : null
                    }
                    <h1 className="title is-size-3-widescreen is-size-3-fullhd is-size-3-desktop is-size-3-tablet is-size-5-mobile">{props.idea.upvotes.length}</h1>
                </div>
            </div>

            {/*Columns for personal details*/}
            {props.showAuthor ?
                <div className="columns has-content-left " id="idea-author-info">
                    <div
                        className="
                            column is-grouped-centered
                            is-one-quarter-fullhd is-one-quarter-widescreen is-two-fifths-desktop is-5-tablet is-full-mobile
                            is-offset-three-quarters-fullhd is-offset-three-quarters-widescreen is-offset-three-fifths-desktop is-offset-7-tablet">
                        <figure className="media has-text-left-mobile">
                            <div className="media-left">
                                <Avatar size={"is-48x48"} imgURL={props.idea.authorProfPicURL}/>
                            </div>
                            <div className="media-content" id="author-name">
                                <div className="content">
                                    <p>
                                        <strong
                                            className="title is-size-6-fullhd is-size-6-widescreen is-size-6-desktop is-size-6-tablet is-size-7-mobile">{props.idea.authorFirstName + ' ' + props.idea.authorLastName} - {props.idea.authorPosition}</strong>
                                    </p>
                                </div>
                            </div>
                        </figure>
                    </div>
                </div>
                : null}
        </div>
    );
}
