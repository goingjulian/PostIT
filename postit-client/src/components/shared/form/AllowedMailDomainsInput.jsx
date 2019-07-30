import React, { useState } from 'react';

export default function ArrayForm(props) {
    const [tempValue, setTempValue] = useState('');

    function onValueSet(value) {
        let secureValue = props.field.filterInput ? props.field.filterInput(value) : value;
        setTempValue(secureValue);
    }

    return <>
        <div className="field has-addons">
            <div className="control has-icons-left" id='addonField'>
                <input
                    id={props.fieldName}
                    name={props.fieldName}
                    className={`input ${props.field.errorType}`}
                    type="text"
                    placeholder={props.field.displayText}
                    value={tempValue}
                    onChange={(e) => onValueSet(e.target.value)}
                    autoComplete={props.field.disableAutoComplete ? 'off' : 'on'}
                    maxLength={props.field.maxLength ? props.field.maxLength : 99}
                />
            </div>
            <div className="control">
                <button className="is-right button is-info" onClick={() => {
                    props.setValueAction(props.fieldName, tempValue);
                    setTempValue('');
                }}>
                    <i className={`fas fa-plus-square`} />
                </button>
            </div>
        </div>
        <div id="allowedMailTable" className="field">
            <table className="table is-fullwidth is-hoverable">
                <thead>
                    <tr>
                        <th>Domain name</th>
                        <th className="exampleMail">Example e-mail address</th>
                    </tr>
                </thead>
                <tbody>
                    {props.field.value.length < 1
                        ? <tr>
                            <td>All domains are allowed</td>
                            <td></td>
                        </tr>
                        : props.field.value.map((item, index) => {
                            return <tr key={item}>
                                <td className="domain"><span className="removeDomainBttn" onClick={() => props.field.removeItemFromMultiSelect(props.fieldName, index)}><i className="fas fa-times-circle" /></span>{item}</td>
                                <td className="exampleMail">{`example@${item}`}</td>
                            </tr>
                        })}
                </tbody>
            </table>
            {props.field.subText ? <p>{props.field.subText}</p> : null}
        </div>
    </>
}
