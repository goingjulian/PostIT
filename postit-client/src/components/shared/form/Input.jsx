import React from 'react';

export default function Input(props) {
    return <div className="field">
        <div className="control has-icons-left">
            <input
                id={props.fieldName}
                name={props.fieldName}
                className='input'
                type="text"
                placeholder={props.field.displayText}
                value={props.field.value}
                onChange={(e) => props.setValueAction(props.fieldName, e.target.value)}
                autoComplete={props.field.disableAutoComplete ? 'off' : 'on'}
                maxLength={props.field.maxLength ? props.field.maxLength : 99}
            />
            <span className="icon is-small is-left">
                <i className={`fas ${props.field.icon ? props.field.icon : 'fa-user'}`} />
            </span>
            {props.field.subText ? <p>{props.field.subText}</p> : null}
        </div>
    </div>
}