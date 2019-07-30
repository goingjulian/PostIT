import React from 'react';

export default function LoginForm(props) {
    return (
        <>
            <div className={`field has-addons-centered ${!props.disabled && props.email.allowedMailDomains.length > 0 ? `has-addons` : null}`} key="email">
                <div className="control">
                    {props.disabled
                        ? <input
                            id="email"
                            name="email"
                            className={`input ${props.email.errorType}`}
                            type="email"
                            value={props.email.value.indexOf('@') > 0 ? props.email.value : props.email.value + '@' + props.email.chosenDomain}
                            readOnly disabled />
                        : <input
                            id="email"
                            name="email"
                            className={`input ${props.email.errorType}`}
                            type="email"
                            placeholder={props.email.displayText}
                            value={props.email.value}
                            onChange={props.onEmailChange} />}
                </div>
                {!props.disabled && props.email.allowedMailDomains.length === 1
                    ? <div className="control">
                        <span className="button is-static">
                            @{props.email.allowedMailDomains[0]}
                        </span>
                    </div> : null}
                {!props.disabled && props.email.allowedMailDomains.length > 1
                    ? <div className="control">
                        <span className="select">
                            <select onChange={props.onEmailDomainChange} value={props.email.chosenDomain} id="domain-select">
                                {props.email.allowedMailDomains.map(domain => <option value={domain} key={domain}>@{domain}</option>)}
                            </select>
                        </span>
                    </div> : null}
            </div>
            {props.email.allowedMailDomains.length > 0
                ? <p className="help">You can only login/register with an e-mail address from the listed domains</p>
                : <p className="help">You can login/register with any e-mail address</p>}
        </>
    );
}
