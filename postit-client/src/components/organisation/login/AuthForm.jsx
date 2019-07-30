import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';

import {
    verifyRegisterStatusAction,
    registrationAction,
    resetPromptLoginAction,
    goBackToLoginAction
} from '../../../actions/authentication.actions';
import LoginForm from './LoginForm';
import Form from '../../shared/form/Form';
import { stringsAreEmpty } from '../../../helpers/functions';
import WaitForMail from '../../shared/WaitForMail';
import regex from '../../../helpers/regex';

class AuthContent extends Component {
    constructor(props) {
        super(props);

        this.initialRegFieldsState = {
            firstName: {
                value: '',
                displayText: 'First name'
            },
            lastName: {
                value: '',
                displayText: 'Last name'
            },
            position: {
                value: '',
                displayText: 'Position'
            }
        };

        this.state = {
            email: {
                value: '',
                displayText: 'E-mail',
                chosenDomain: this.props.organisation.allowedMailDomains.length > 0 ? this.props.organisation.allowedMailDomains[0] : '',
                allowedMailDomains: this.props.organisation.allowedMailDomains
            },
            regFields: {
                firstName: { ...this.initialRegFieldsState.firstName },
                lastName: { ...this.initialRegFieldsState.lastName },
                position: { ...this.initialRegFieldsState.position }
            },
            submitDisabled: true
        };
    }

    componentWillUnmount() {
        this.props.resetPromptLogin();
    }

    setValueAction(key, value) {
        const regFieldsCopy = { ...this.state.regFields };
        const regField = { ...regFieldsCopy[key] };
        regField.value = value;
        regFieldsCopy[key] = regField;

        if (this.allFieldsValid(regFieldsCopy)) {
            this.setState({
                regFields: regFieldsCopy,
                submitDisabled: false
            })
        } else {
            this.setState({
                regFields: regFieldsCopy,
                submitDisabled: true
            });
        }
    }

    setValueActionEmail(email) {
        const emailCopy = { ...this.state.email };
        emailCopy.value = email;
        emailCopy.error = false;
        emailCopy.errorMsg = '';

        if (this.emailValid(emailCopy.allowedMailDomains.length > 0 ? emailCopy.value + '@' + emailCopy.chosenDomain : emailCopy.value)) {
            this.setState({
                email: emailCopy,
                submitDisabled: false
            });
        } else {
            this.setState({
                email: emailCopy,
                submitDisabled: true
            });
        }
    }

    allFieldsValid(updatedRegFields) {
        let noEmptyField = true;
        Object.keys(updatedRegFields).forEach((key) => {
            if (stringsAreEmpty(updatedRegFields[key].value)) noEmptyField = false;
        });

        return noEmptyField;
    }

    onEmailDomainChange(domain) {
        if (this.state.email.allowedMailDomains.includes(domain)) {
            const emailCopy = { ...this.state.email };
            emailCopy.chosenDomain = domain;
            this.setState({ email: emailCopy });
        }
    }

    emailValid(email) {
        return regex.email.test(email);
    }

    submitButtonAction() {
        const email = this.state.email.allowedMailDomains.length > 0 ? this.state.email.value + '@' + this.state.email.chosenDomain : this.state.email.value;
        if (this.props.registrationRequired) {
            if (this.allFieldsValid(this.state.regFields) && this.emailValid(email)) this.props.registrationAction(
                this.props.organisation.organisationName,
                email,
                this.state.regFields.firstName.value,
                this.state.regFields.lastName.value,
                this.state.regFields.position.value);
        } else {
            if (this.emailValid(email)) {
                this.props.verifyRegisterStatus(this.props.organisation.organisationName, email);
                this.setState({ submitDisabled: true });
            }
        }
    }

    goBackToLogin() {
        this.setState({
            regFields: {
                firstName: { ...this.initialRegFieldsState.firstName },
                lastName: { ...this.initialRegFieldsState.lastName },
                position: { ...this.initialRegFieldsState.position }
            },
            submitDisabled: false
        });
        this.props.goBackToLoginAction();
    }

    render() {
        const buttons = <div className="field is-grouped btn-group">
            <div className="control buttons">
                {this.props.registrationRequired ?
                    <button
                        onClick={() => this.goBackToLogin()}
                        className="button cta-grey"><i className="fas fa-long-arrow-alt-left" />
                    </button> : null
                }
                <button
                    onClick={() => this.submitButtonAction()}
                    className="button cta-green"
                    id="submit-login"
                    disabled={this.state.submitDisabled}> Submit
                </button>
                <button
                    className="button cta-orange"
                    onClick={() => {
                        this.props.history.goBack();
                        this.props.resetPromptLogin();
                    }}> Cancel
                </button>
            </div>
        </div >;

        if (this.props.waitForMail) return <WaitForMail
            email={this.state.email.allowedMailDomains.length > 0 ? this.state.email.value + '@' + this.state.email.chosenDomain : this.state.email.value} />;

        else if (this.props.registrationRequired) {
            return <div><p className={"logintext"}>Complete your profile by filling in your details</p>
                <LoginForm
                    email={this.state.email}
                    disabled={this.props.registrationRequired} />
                <Form
                    regFields={this.state.regFields}
                    setValueAction={(key, value) => this.setValueAction(key, value)} />
                {buttons}
            </div>
        } else return <div><p className="logintext">Enter your e-mail address to continue</p>
            <LoginForm
                onEmailChange={(e) => this.setValueActionEmail(e.target.value)}
                onEmailDomainChange={(e) => this.onEmailDomainChange(e.target.value)}
                email={this.state.email} />{buttons}</div>
    }
}

function mapStateToProps(state) {
    return {
        organisation: state.authentication.organisation,
        registrationRequired: state.authentication.registrationRequired,
        waitForMail: state.authentication.waitForMail
    }
}

function mapDispatchToProps(dispatch) {
    return {
        verifyRegisterStatus: (organisation, email) => dispatch(verifyRegisterStatusAction(organisation, email)),
        registrationAction: (...args) => dispatch(registrationAction(...args)),
        resetPromptLogin: () => dispatch(resetPromptLoginAction()),
        goBackToLoginAction: () => dispatch(goBackToLoginAction())
    }
}


export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(AuthContent);
