import React from 'react';
import Comment from "./Comment";

export default function CommentList(props) {

    return [...props.comments].reverse().map((comment) => {
        return (
            <div className="columns" key={comment._id}>
                <div className="column is-8 is-offset-2">
                    <Comment comment={comment} ideaNumber={props.ideaNumber} />
                </div>
            </div>
        );
    })

}