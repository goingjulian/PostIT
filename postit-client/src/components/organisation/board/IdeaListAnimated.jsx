import React from 'react';
import Idea from '../../shared/Idea';
import posed, { PoseGroup } from 'react-pose';

const AnimatedIdea = posed.div({});

export default function IdeaListAnimated(props) {
    const ideaList = [...props.ideas].slice(0, props.amountShown);

    if(ideaList.length < 1) return <h1 className="title is-centered">No ideas found! Add your own by visiting the link below</h1>

    return ideaList.map(idea => {
        return <div className="columns" key={idea._id}>
            <div className="column is-10 is-offset-1">
                <PoseGroup>
                    <AnimatedIdea key={idea._id}>
                        <Idea
                            maxLengthDescription={200}
                            idea={idea}
                            upvoted={idea.recentlyUpvoted}
                            showDescription
                        />
                    </AnimatedIdea>
                </PoseGroup>
            </div>
        </div>

    });
}
