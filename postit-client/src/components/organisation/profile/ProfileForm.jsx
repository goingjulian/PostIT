import React, { useState } from 'react';
import * as ReactRedux from 'react-redux';

import Loader from '../../shared/Loader';
import FormSequence from '../../shared/form/FormSequence';
import { updateEmployeeWithPicAction, updateEmployeeAction, setProfileUpdatingAction } from "../../../actions/authentication.actions";

function ProfileForm(props) {
    const [values, setValues] = useState({
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        position: props.user.position,
        profilePic: null
    });

    const sequence = [
        {
            fields: {
                firstName: {
                    value: values.firstName,
                    displayText: 'Your first name',
                    maxLength: 30
                },
                lastName: {
                    value: values.lastName,
                    displayText: 'Your last name',
                    maxLength: 30
                },
                position: {
                    value: values.position,
                    displayText: 'Your position within the organisation',
                    maxLength: 40
                },
                profilePic: {
                    value: values.profilePic,
                    displayText: 'Profile picture',
                    type: 'img-upload',
                    icon: 'fa-image',
                    uploading: false,
                    uploadImage: setValue,
                    setImgUploading: () => { }
                }
            },
            title: 'Your profile',
            infoText: 'You can change your profile details here',
            submitBttnText: 'Save'
        }
    ];

    function setValue(key, value) {
        const valuesCopy = { ...values };
        valuesCopy[key] = value;
        setValues(valuesCopy);
    }

    function finalSubmitAction(values) {
        if (values.profilePic) props.updateEmployeeWithPicAction(props.organisation.organisationName, values);
        else props.updateEmployeeAction(props.organisation.organisationName, values);
    }

    return props.profileUpdating ?
        <Loader subtitle="Loading profile..." />
        : <FormSequence
            sequence={sequence}
            stage={0}
            setValueAction={setValue}
            finalSubmitAction={finalSubmitAction} />
}

function mapStateToProps(state) {
    return {
        user: state.authentication.user,
        organisation: state.authentication.organisation,
        profileUpdating: state.authentication.profileUpdating
    }
}

function mapDispatchToProps(dispatch) {
    return {
        updateEmployeeWithPicAction: (...args) => dispatch(updateEmployeeWithPicAction(...args)),
        updateEmployeeAction: (...args) => dispatch(updateEmployeeAction(...args)),
        setProfileUpdating: (...args) => dispatch(setProfileUpdatingAction(...args))
    };
}

export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(ProfileForm);
