import React, {useState, useEffect} from 'react';
import Idea from "../../shared/Idea";
import Comment from "../ideas/Comment";

import posed, {PoseGroup} from 'react-pose';

const Box = posed.div({
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            delay: 100,
            duration: 500,
            ease: 'linear'
        }
    },
    exit: {
        y: 100,
        opacity: 0,
        transition: { duration: 500 }
    }
});
export default function NewIdea(props) {
    const [isVisible, setVisibilty] = useState(false);
    useEffect(() => {
        setVisibilty(true);

        if(props.time){
        setTimeout(() => {
            console.log('nu');
            setVisibilty(false);

        }, (props.time * 1000) - 500);
        }
    }, [props.idea, props.time]);
    return (
        <PoseGroup>
            {isVisible && [
                <Box key={1}>
                    <div className="container">
                        <div className="columns">
                            <div className="column has-text-centered">

                                {props.showLastComment ? <h3 className="title">New comment!</h3> :
                                    <h3 className="title">New idea!</h3>}

                            </div>
                        </div>

                        <Idea idea={props.idea} showAuthor showDescription/>

                        <div className="columns">
                            <div className="column is-8 is-offset-2">
                                {props.showLastComment ?
                                    <>
                                        <Comment hideupvotes comment={props.idea.comments[props.idea.comments.length - 1]}
                                                 ideaNumber={props.ideaNumber}/>
                                        <br/>
                                    </>
                                    : null}
                            </div>
                        </div>
                    </div>
                </Box>
            ]}
        </PoseGroup>
    )
}

