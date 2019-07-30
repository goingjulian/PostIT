import React, {Component} from 'react';
import * as ReactRedux from 'react-redux';
import QRCode from 'qrcode-react';

import {fetchIdeasForOrganisationAction} from "../../../actions/ideas.actions";
import NewContent from "./NewContent";
import IdeaListAnimated from "./IdeaListAnimated";
import TimedProgressBar from "./TimedProgressBar";
import {OWN_URL} from "../../../index";
import {Link} from "react-router-dom";
import {deleteBoardRequestAction} from "../../../actions/board.actions";
import StaticLoader from '../../shared/StaticLoader';

const screenSizeMultiplier = 215;

class Board extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ideas: this.props.ideas !== null ? [...this.props.ideas].sort((a, b) => b.upvotes.length - a.upvotes.length) : [],
            request: this.props.defaultScreen,
            amountShown: window.innerHeight / screenSizeMultiplier
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.ideas !== null) {
            const newIdeasSorted = nextProps.ideas.sort((a, b) => b.upvotes.length - a.upvotes.length);
            if (newIdeasSorted.length > 0) newIdeasSorted[0].upvoteClass = 'mostVoted';
            const updatedIdeas = this.checkIfUpvoteWasAdded(newIdeasSorted, this.state.ideas);
            this.setState({
                ideas: updatedIdeas,
                request: nextProps.requests.length ? nextProps.requests[0] : this.props.defaultScreen
            });
        }
    }

    ideasForWindow = () => {
        this.setState({amountShown: window.innerHeight / screenSizeMultiplier});
    }

    checkIfUpvoteWasAdded(newIdeasSorted, oldIdeas) {
        const newIdeasSortedCopy = [...newIdeasSorted];
        for (let index in newIdeasSortedCopy) {
            const newIdea = {...newIdeasSortedCopy[index]};
            const matchingOldIdea = oldIdeas.find(oldIdea => oldIdea._id === newIdea._id);

            if (matchingOldIdea && newIdea.upvotes.length > matchingOldIdea.upvotes.length) {
                const newIdeaCopy = {...newIdea, recentlyUpvoted: true, originalIndex: index};
                newIdeasSortedCopy.splice(index, 1);
                newIdeasSortedCopy.unshift(newIdeaCopy);
            }
        }
        return newIdeasSortedCopy;
    }

    componentDidMount() {
        this.props.fetchIdeasForOrganisation(this.props.organisation.organisationName);
        window.addEventListener('resize', this.ideasForWindow, true);
    }

    findIndexIdea = (id) => {
        return this.props.ideas.findIndex(idea => idea._id === id);
    };

    shiftIdeas = () => {
        const ideas = [...this.state.ideas];
        let lastElement = ideas.pop();

        if (lastElement && lastElement.recentlyUpvoted) {
            lastElement.recentlyUpvoted = undefined;
            ideas.splice(lastElement.originalIndex, 0, lastElement);
            const ideaToMove = ideas.pop();
            ideas.unshift(ideaToMove);
        } else {
            ideas.unshift(lastElement);
        }
        this.setState({ideas: ideas});
    };

    screen = (request) => ({
        "DEFAULT": {
            method: this.shiftIdeas,
            component: <IdeaListAnimated ideas={[...this.state.ideas]} amountShown={this.state.amountShown}/>,
            time: 10
        },
        "ADD_IDEA": {
            method: () => this.props.doDeleteRequest(request.screen, request.ideaId),
            component: this.props.ideas !== null && this.props.ideas.length > 0 ?
                <NewContent time={20} idea={this.props.ideas[this.findIndexIdea(request.ideaId)]}/> : null,
            time: 20
        },
        "ADD_COMMENT": {
            method: () => this.props.doDeleteRequest(request.screen, request.ideaId),
            component: this.props.ideas !== null && this.props.ideas.length > 0 ?
                <NewContent time={20} idea={this.props.ideas[this.findIndexIdea(request.ideaId)]}
                            showLastComment={true}/> : null,
            time: 20
        }
    })[request.screen];

    render() {
        return (
            <section id="screen" className="has-text-centered">

                {this.props.ideas === null ?
                    <StaticLoader amountShown={this.state.amountShown} height={148}/>
                    : this.screen(this.state.request).component}

                <Link to={`/${this.props.organisation.organisationName}/`}><i
                    className="fas fa-times board-nav"></i></Link>

                <h1 id="actionText" className="title is-4">Submit your idea at <span
                    className="fakeURL">{`${OWN_URL}/${this.props.organisation.organisationName}`}</span>
                </h1>

                <div id="qrCode">
                    <QRCode id="qrCode" value={`${OWN_URL}/${this.props.organisation.organisationName}`}/>
                </div>

                {this.props.ideas !== null && this.props.ideas.length ?
                    <TimedProgressBar key={this.state.request.screen ? this.state.request.screen: this.props.defaultScreen} length={this.screen(this.state.request).time} finishAction={() => {
                        this.screen(this.state.request).method();
                        this.setState({request: this.props.requests.length ? this.props.requests[0] : this.props.defaultScreen});
                    }}/>
                    : null}

            </section>
        );
    }
}

function mapStateToProps(state) {
    return {
        ideas: state.ideasOverview.ideas,
        organisation: state.authentication.organisation,
        requests: state.board.requests,
        defaultScreen: state.board.default,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        fetchIdeasForOrganisation: (organisation) => dispatch(fetchIdeasForOrganisationAction(organisation)),
        doDeleteRequest: (screen, ideaId) => dispatch(deleteBoardRequestAction(screen, ideaId))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Board);
