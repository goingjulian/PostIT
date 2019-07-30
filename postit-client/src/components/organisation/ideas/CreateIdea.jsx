import React, { Component } from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router-dom';

import { toggleCreateIdeaFormAction } from '../../../actions/ideas.actions';
import Avatar from '../../shared/Avatar';
import { promptLoginAction } from '../../../actions/authentication.actions';
import { addIdeaAction, addIdeaClearErrorAction, addIdeaErrorAction } from "../../../actions/ideas.actions";
import { stringsAreNotEmpty } from '../../../helpers/functions';
import AddButton from "../../shared/AddButton";

class CreateIdea extends Component {
	constructor(props) {
		super(props);

		this.state = {
			allFieldsValid: false,
			title: '',
			description: ''
		};
	}

	titleFieldOnChange(evt) {
		const value = evt.target.value;

		if (stringsAreNotEmpty(this.state.description, value)) {
			this.setState({
				allFieldsValid: true,
				title: value
			});
		} else {
			this.setState({
				allFieldsValid: false,
				title: value
			});
		}
	}

	descFieldOnChange(evt) {
		const value = evt.target.value;

		if (stringsAreNotEmpty(this.state.title, value)) {
			this.setState({
				allFieldsValid: true,
				description: value
			});
		} else {
			this.setState({
				allFieldsValid: false,
				description: value
			});
		}
	}

	submitForm() {
		if (stringsAreNotEmpty(this.state.title, this.state.description)) {
			this.props.doPostIdea(this.props.organisation.organisationName, this.state.title, this.state.description);
			this.setState({
				allFieldsValid: false,
				title: '',
				description: ''
			});
		} else {
			this.props.addIdeaErrorAction('Your idea could not be added');
		}
	}

	openFormAction() {
		if (this.props.user === null) this.props.promptLogin();
		else this.props.toggleCreateIdeaField(true);
	}

	render() {
		if (!this.props.createIdeaField) return <Link to={`/${this.props.organisation.organisationName}/login`}>
			<AddButton noContentError={this.props.overviewError} hasContent={this.props.hasIdeas} onClickAction={() => this.openFormAction()} />
		</Link>;

		return (
			<div className="box column is-10 is-offset-1">
				<div className="media">
					<div className="media-left">
						<Avatar imgURL={this.props.user.profilePic} />
					</div>
					<div className="media-content">
						<div className="content">
							<div>
								<strong>{this.props.user.firstName} {this.props.user.lastName}</strong>
								<small> {this.props.user.position}</small>
								<br />
								<div className="field">
									<label className="label">Title of your idea</label>
									<div className="control has-icons-left">
										<input
											className="input"
											type="text"
											id="idea-title-input"
											autoComplete="off"
											placeholder="Title of your idea"
											value={this.state.title}
											onChange={(evt) => this.titleFieldOnChange(evt)}
										/>
										<span className="icon is-small is-left">
											<i className="fas fa-heading" />
										</span>
									</div>
								</div>
								<div className="field">
									<label className="label">Description of your idea</label>
									<div className="control">
										<textarea
											className="textarea"
											id="idea-description-input"
											autoComplete="off"
											placeholder="Describe your idea, make a story out of it!"
											value={this.state.description}
											onChange={(evt) => this.descFieldOnChange(evt)}
										/>
									</div>
								</div>
								<div className="field is-grouped">
									<div className="control">
										<button disabled={!this.state.allFieldsValid} className="button is-link" id="submit-idea-button" onClick={() => this.submitForm()}>Submit</button>
									</div>
									<div
										className="button is-text"
										onClick={() => {
											this.props.addIdeaClearErrorAction();
											this.props.toggleCreateIdeaField(false);
										}} >
										Cancel
									</div>
								</div>
								<ErrorMessage errorMessage={this.props.errorMessageIdeaAdded} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
function ErrorMessage(props) {
	return props.errorMessage ? <p className="help is-danger">{props.errorMessage}</p> : null

}

function mapStateToProps(state) {
	return {
		createIdeaField: state.ideasOverview.createIdeaField,
		headerInputField: state.ideasOverview.headerInputField,
		textInputField: state.ideasOverview.textInputField,
		errorMessageIdeaAdded: state.ideasOverview.errorMessageIdeaAdded,
		user: state.authentication.user,
		organisation: state.authentication.organisation
	};
}

function mapDispatchToProps(dispatch) {
	return {
		toggleCreateIdeaField: (boolean) => dispatch(toggleCreateIdeaFormAction(boolean)),
		addIdeaClearErrorAction: () => dispatch(addIdeaClearErrorAction()),
		addIdeaErrorAction: (message) => dispatch(addIdeaErrorAction(message)),
		doPostIdea: (organisation, username, description, title) => dispatch(addIdeaAction(organisation, username, description, title)),
		promptLogin: () => dispatch(promptLoginAction())
	};
}
export default ReactRedux.connect(mapStateToProps, mapDispatchToProps)(CreateIdea);
