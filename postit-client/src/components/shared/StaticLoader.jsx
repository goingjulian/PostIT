import React from 'react';
import Skeleton from 'react-skeleton-loader';

export default function StaticLoader(props) {
    const amount = props.amountShown ? parseInt(props.amountShown) : 3;
    const height = props.height ? props.height : 192;
    let content = [];

    for (let i = 0; i < amount; i++) {
        content.push(<div className="columns" key={i}>
            <div className="column is-10 is-offset-1">
                <Skeleton widthRandomness={0} width="100%" height={height + 'px'} color={'#e6e6e6'} count={1} />
            </div>
        </div>);
    }
    return content;
}