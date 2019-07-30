import React from 'react';

/**
 *
 * @img Image of the user (link)
 * @link Link that refers to the user profile page (# if not desired)
 * @size Size of the avatar (Default 64x64)
 */
export default class ProgressBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            progress: 0,
        };
    }

    componentWillMount() {
        this.interval = setInterval(this.countdown, 10);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    countdown = () => {
        if (this.state.progress >= this.props.length) {
            this.setState({ progress: 0 });
            this.props.finishAction();
        } else {
            this.setState({ progress: { ...this.state }.progress += 0.01 });
        }
    };

    render = () => <progress className="progress is-info progress-bar" value={this.state.progress} max={this.props.length} />;
}
