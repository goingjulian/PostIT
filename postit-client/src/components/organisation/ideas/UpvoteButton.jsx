import React, { useState, useEffect } from 'react';
/**
 * @size Changes the size of the upvote button - Default: none
 * @upvotes Number of upvotes the button has, shows next to it
 * @sessionUid The users session unique identifier (but not it's sessionId)
 * @upvoteFunction the business logic function for this upvote functionality
 */


export default function UpvoteButton(props) {
    let [alreadyUpvoted, setAlreadyUpvoted] = useState(props.upvotes.includes(props.sessionUid) ? 'upvoted' : 'notUpvoted');

    useEffect(() => {
        setAlreadyUpvoted(props.upvotes.includes(props.sessionUid) ? 'upvoted' : 'notUpvoted');
    }, [props.upvotes, props.sessionUid]);
    return (

        <div className="is-mobile has-text-centered">
                {props.showUpvoteNumber ? props.upvotes.length : null}
                <div className="level-item upvote-pointer " aria-label="upvote"
                    onClick={() => props.upvoteFunction()}>
                    <span className={`icon is-large level-item is-tooltip-danger tooltip is-tooltip-active ${alreadyUpvoted}`}>
                        <i className={`fas fa-chevron-up ${props.size}`} />
                    </span>
                </div>
        </div >

    );
}
