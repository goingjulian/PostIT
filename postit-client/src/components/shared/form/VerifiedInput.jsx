import React from 'react';

export default function VerifiedInput(props) {
    let button;

    if (props.field.value === '') button = { class: 'is-info', text: 'Please enter a name' };
    else if (props.field.fieldValid()) button = { class: 'is-success', text: `This name is available` };
    else button = { class: 'is-danger', text: `This name is already taken` };

    return <>
        <div className="field has-addons">
            <div className="control has-icons-left" id='addonField'>
                <input
                    id={props.fieldName}
                    name={props.fieldName}
                    className='input'
                    type="text"
                    placeholder={props.field.displayText}
                    value={props.field.value}
                    onChange={(e) => props.setValueAction(props.fieldName, e.target.value)}
                    autoComplete={props.field.disableAutoComplete ? 'off' : 'on'}
                />
            </div>
            <div className="control">
                <span className={`is-right button ${button.class}`}>
                    <i className={`fas fa-info-circle`} />
                    &nbsp; {button.text}
                </span>
            </div>
        </div>
        {props.field.subText ? <p>{props.field.subText}</p> : null}
    </>
}