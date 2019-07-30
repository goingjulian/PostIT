import React from 'react';

export default function EmailInput(props) {
    return <>
        <div className={`field ${!props.field.disabled && props.field.allowedMailDomains.length > 0 ? `has-addons` : null}`}>
            <div className="control has-icons-left" id='addonField'>
                {props.field.disabled
                    ? <input
                        id='email'
                        name={props.fieldName}
                        className='input'
                        type="email"
                        value={props.field.value + '@' + props.field.domain}
                        readOnly disabled 
                        maxLength={props.field.maxLength ? props.field.maxLength : 99}
                        />
                    : <input
                        id='email'
                        name={props.fieldName}
                        className='input'
                        type="email"
                        placeholder={props.field.displayText}
                        value={props.field.value}
                        onChange={e => props.setValueAction(props.fieldName, e.target.value)} 
                        maxLength={props.field.maxLength ? props.field.maxLength : 99}
                        />}
                <span className="icon is-small is-left">
                    <i className={`fas ${props.field.icon ? props.field.icon : 'fa-user'}`} />
                </span>
            </div>
            {!props.field.disabled && props.field.allowedMailDomains.length === 1
                ? <div className="control">
                    <span className="button is-static">
                        @{props.field.allowedMailDomains[0]}
                    </span>
                </div> : null}
            {!props.field.disabled && props.field.allowedMailDomains.length > 1
                ? <div className="control">
                    <span className="select">
                        <select onChange={e => props.field.setEmailDomain(e.target.value)} value={props.field.domain}>
                            {props.field.allowedMailDomains.map(domain => <option value={domain} key={domain}>@{domain}</option>)}
                        </select>
                    </span>
                </div> : null}
        </div>
        {props.field.allowedMailDomains.length > 1 && <p className="help">You can only authenticate with an e-mail address from the listed domains</p>}
        {props.field.allowedMailDomains.length === 1 &&  <p className="help">You can only authenticate with an e-mail address with domain {props.field.allowedMailDomains[0]}</p>}
        {props.field.allowedMailDomains.length < 1 && <p className="help">You can authenticate with any e-mail address</p>}
    </>
}