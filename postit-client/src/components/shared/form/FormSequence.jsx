import React, { useState, useEffect } from 'react';
import { stringsAreEmpty } from '../../../helpers/functions';

import Form from './Form';

export default function FormSequence(props) {
    const [submitDisabled, setSubmitDisabled] = useState(true);

    useEffect(() => {
        if (allFieldsValid(props.sequence[props.stage].fields)) setSubmitDisabled(false);
        else setSubmitDisabled(true);
    }, [props.sequence, props.stage])

    function setValue(key, value) {
        const sequenceCopy = [...props.sequence];
        const form = { ...sequenceCopy[props.stage] };
        const fields = { ...form.fields };
        let field = { ...fields[key] };

        let secureValue = field.filterInput ? field.filterInput(value) : value;

        field = { ...field, value: secureValue };
        props.setValueAction(key, secureValue);

        if (field.onValueSet) field.onValueSet(secureValue);

        if (allFieldsValid(fields)) setSubmitDisabled(false);
        else setSubmitDisabled(true);
    }

    function allFieldsValid(updatedRegFields) {
        let noEmptyField = true;
        Object.keys(updatedRegFields).forEach((key) => {
            const field = updatedRegFields[key];
            if(field.maxLength && field.value.length > field.maxLength) noEmptyField = false;

            if (field.fieldValid && !field.fieldValid(field.value)) noEmptyField = false;
            else if (field.fieldValid === undefined && !field.optional && stringsAreEmpty(field.value)) noEmptyField = false;

        });
        return noEmptyField;
    }

    function prepareFieldsBeforeSubmit(sequence) {
        const sequenceCopy = [...sequence];
        const valuesList = {};

        for (let form of sequenceCopy) {
            Object.keys(form.fields).forEach(key => {
                const field = { ...form.fields[key] };
                if (field.type === 'email-input' && field.allowedMailDomains.length > 0) valuesList[key] = `${field.value}@${field.domain}`;
                else valuesList[key] = field.value;
            });
        }
        return valuesList;
    }

    function onSubmit() {
        if (allFieldsValid(props.sequence[props.stage].fields)) {
            if (props.stage === props.sequence.length - 1) props.finalSubmitAction(prepareFieldsBeforeSubmit(props.sequence));
            else props.nextStage();
        }
    }

    const currentStageSequence = props.sequence[props.stage];
    const finalStageSequence = props.sequence[props.sequence.length - 1];
    return <>
        <h1 className='title is-5'>{currentStageSequence.title}</h1>
        <h2 className='subtitle'>{currentStageSequence.infoText}</h2>

        <Form regFields={currentStageSequence.fields} setValueAction={setValue} />

        {props.sequence.length > 1 ? <progress className="progress is-info" value={props.stage} max={props.sequence.length - 1} /> : null}

        {props.stage > 0 ? <button onClick={props.prevStage} className="button cta-grey"><i className="fas fa-long-arrow-alt-left" /></button> : null}
        <button className="button is-info" id="next-button" disabled={submitDisabled} onClick={onSubmit}>
            {props.stage === props.sequence.length - 1 ?
                finalStageSequence.submitBttnText ? finalStageSequence.submitBttnText : 'Submit'
                : 'Next'}
        </button>
    </>;
}
