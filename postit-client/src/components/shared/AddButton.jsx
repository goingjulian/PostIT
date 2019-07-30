import React from 'react';
import Skeleton from 'react-skeleton-loader';

export default function AddButton(props) {
    return (
        <div
            className="column">
            {
                props.noContentError ?
                    <button className="button cta-green" onClick={props.onClickAction} id="add-button-no-content" >
                        <span>Add idea</span>
                        <span className="icon is-small">
                            <i className="fas fa-plus" />
                        </span>
                    </button>
                    :
                    props.hasContent ?
                        <div
                            id="add-button-container"
                            onClick={props.onClickAction}>
                            <p><i className="fas fa-plus-circle fa-3x" id="add-button" /></p>
                        </div>
                        : <Skeleton color={'#e6e6e6'} borderRadius="50%" circle={true} widthRandomness={0} width="50px"/>
            }
        </div>
    );
}
