import React, { useEffect } from 'react';
import * as ReactRedux from 'react-redux';
import queryString from 'query-string'

import { SERVER_PROTOCOL, SERVER_URL } from '../../index';
import FormSequence from '../shared/form/FormSequence';
import regex from '../../helpers/regex';
import {
    nextStageAction, setOrgNameValidAction,
    checkOrganisationNameAvailableAction, registerOrganisationAction,
    prevStageAction, removeItemFromMultiSelectAction, uploadImageAction,
    setImgUploadingAction, setStageAction, setValueAction
} from '../../actions/createOrganisation.actions';

function CreateOrgForm(props) {
    const queryParams = queryString.parse(props.location.search);
    const stageParam = queryParams.stage ? parseInt(queryString.parse(props.location.search).stage) : null;

    const { history, stage, setStage } = props;

    useEffect(() => {
        if (stageParam !== null && stageParam < stage && stageParam >= 0) setStage(stageParam);
        else if (stageParam !== null && stage === 0 && stageParam > 0) history.push('/home?stage=0');
        else if (stageParam === null) history.push(`/home?stage=${stage}`);
    }, [history, stage, stageParam, setStage]);

    function isValidEmail(value) {
        const email = props.values.allowedMailDomains.length > 0 ? value + '@' + props.values.emailDomain : value;
        return regex.email.test(email);
    }

    function isValidOrganisationName(name) {
        if (props.orgNameValid && !regex.emptyString.test(name)) return true;
        else return false;
    }

    function nextStage() {
        props.nextStage();
        props.history.push(`/home?stage=${parseInt(props.stage + 1)}`);
    }

    function prevStage() {
        props.prevStage();
        props.history.push(`/home?stage=${parseInt(props.stage - 1)}`);
    }

    const sequence = [
        {
            fields: {
                organisationName: {
                    value: props.values.organisationName,
                    displayText: 'Organisation name',
                    fieldValid: isValidOrganisationName,
                    filterInput: value => value.replace(regex.allButLetters, ''),
                    onValueSet: props.checkOrganisationNameAvailable,
                    disableAutoComplete: true,
                    icon: 'fa-building',
                    type: 'verified-input',
                    subText: props.values.organisationName ? `The URL for your organisation will be: 
                    ${SERVER_PROTOCOL}://${SERVER_URL}/${props.values.organisationName}` : null
                }
            },
            title: 'Organisation name',
            infoText: 'Please enter a name for the organisation. Must be lowercase and cannot contain spaces'
        },
        {
            fields: {
                logoImg: {
                    value: props.values.logoImg.value,
                    displayText: 'Logo image',
                    type: 'img-upload',
                    icon: 'fa-image',
                    uploading: props.values.logoImg.uploading,
                    uploadImage: (key, imageFile) => props.uploadImage(props.values.organisationName, 'logo', key, imageFile),
                    setImgUploading: props.setImgUploading
                },
                backgroundImg: {
                    value: props.values.backgroundImg.value,
                    displayText: 'Background image',
                    type: 'img-upload',
                    icon: 'fa-image',
                    uploading: props.values.backgroundImg.uploading,
                    uploadImage: (key, imageFile) => props.uploadImage(props.values.organisationName, 'background', key, imageFile),
                    setImgUploading: props.setImgUploading
                }
            },
            title: 'Image upload',
            infoText: 'Please upload two images, the logo of your organisation and one that can be used as a background'
        },
        {
            fields: {
                allowedMailDomains: {
                    value: props.values.allowedMailDomains,
                    displayText: 'Allowed e-mail domains',
                    filterInput: value => {
                        const stripped = value.replace('@', '');
                        return stripped.replace(regex.allButLettersAndDomain, '')
                    },
                    removeItemFromMultiSelect: props.removeItemFromMultiSelect,
                    type: 'multi-input',
                    subText: props.values.allowedMailDomains.length < 1
                        ? `All e-mail domains are currently allowed`
                        : `Only the e-mail domains from the list are currently allowed`,
                    optional: true
                }
            },
            title: 'Allowed e-mail domains',
            infoText: 'You can restrict the e-mail domains that employees can register with at this organisation. You can add one or multiple domains. ' +
                'You can also allow any e-mail domain by leaving the table blank'
        },
        {
            fields: {
                email: {
                    value: props.values.email,
                    displayText: 'Your own e-mail address',
                    icon: 'fa-envelope',
                    type: 'email-input',
                    domain: props.values.emailDomain,
                    allowedMailDomains: props.values.allowedMailDomains,
                    fieldValid: isValidEmail,
                    filterInput: value => value.replace(regex.hasWhiteSpace, ''),
                    setEmailDomain: domain => {
                        if (props.values.allowedMailDomains.includes(domain)) {
                            props.setValue('emailDomain', domain);
                        }
                    }
                },
                firstName: {
                    value: props.values.firstName,
                    displayText: 'Your first name'
                },
                lastName: {
                    value: props.values.lastName,
                    displayText: 'Your last name'
                },
                position: {
                    value: props.values.position,
                    displayText: 'Your position within the organisation'
                }
            },
            title: 'Your details',
            infoText: 'Please enter your details. You will be registered as the administrator for this organisation. You need to verify your e-mail address after this step'
        }
    ];

    return <FormSequence
        sequence={sequence}
        stage={props.stage}
        nextStage={nextStage}
        prevStage={prevStage}
        setValueAction={props.setValueAction}
        finalSubmitAction={(...args) => {
            props.registerOrganisation(...args, props.history);
        }} />
}

function mapStateToProps(state) {
    return {
        values: state.createOrganisation.values,
        stage: state.createOrganisation.stage,
        orgNameValid: state.createOrganisation.orgNameValid,
        orgAdded: state.createOrganisation.orgAdded
    }
}

function mapDispatchToProps(dispatch) {
    return {
        setValueAction: (...args) => dispatch(setValueAction(...args)),
        nextStage: (...args) => dispatch(nextStageAction(...args)),
        prevStage: (...args) => dispatch(prevStageAction(...args)),
        setStage: (...args) => dispatch(setStageAction(...args)),
        setOrgNameValid: (...args) => dispatch(setOrgNameValidAction(...args)),
        checkOrganisationNameAvailable: (...args) => dispatch(checkOrganisationNameAvailableAction(...args)),
        registerOrganisation: (...args) => dispatch(registerOrganisationAction(...args)),
        removeItemFromMultiSelect: (...args) => dispatch(removeItemFromMultiSelectAction(...args)),
        uploadImage: (...args) => dispatch(uploadImageAction(...args)),
        setImgUploading: (...args) => dispatch(setImgUploadingAction(...args))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(CreateOrgForm);

