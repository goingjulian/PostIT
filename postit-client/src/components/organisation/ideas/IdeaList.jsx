import React from 'react';
import Idea from '../../shared/Idea';
import posed, { PoseGroup } from "react-pose";
import StaticLoader from '../../shared/StaticLoader';

const AnimatedIdea = posed.div({});

export default function IdeaList(props) {
    if (props.ideas === null) return <StaticLoader />;

    const ideaList = [...props.ideas].sort((a, b) => (b.upvotes.length - a.upvotes.length)).slice(0, props.maxIdeas);

    return ideaList.map((idea) => {
        return (
            <div className="columns" key={idea._id}>
                <div className="column is-10 is-offset-1">
                    <PoseGroup>
                        <AnimatedIdea key={idea._id}>
                            <Idea
                                idea={idea}
                                showDescription
                                upvotingEnabled
                                linkToDetail
                                showAuthor
                                alignleft
                            />
                        </AnimatedIdea>
                    </PoseGroup>
                </div>
            </div>
        );
    });
}
