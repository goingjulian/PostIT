/*
  /$$$$$$$                       /$$    /$$$$$$ /$$$$$$$$
| $$__  $$                     | $$   |_  $$_/|__  $$__/
| $$  \ $$ /$$$$$$   /$$$$$$$ /$$$$$$   | $$     | $$   
| $$$$$$$//$$__  $$ /$$_____/|_  $$_/   | $$     | $$   
| $$____/| $$  \ $$|  $$$$$$   | $$     | $$     | $$   
| $$     | $$  | $$ \____  $$  | $$ /$$ | $$     | $$   
| $$     |  $$$$$$/ /$$$$$$$/  |  $$$$//$$$$$$   | $$   
|__/      \______/ |_______/    \___/ |______/   |__/                                                         

Copyright (c) 2019, Julian Korf de Gidts, Randy Grouls, Kevin van Schaijk 
All rights reserved. 

Redistribution and use in source and binary forms, with or without 
modification, are permitted provided that the following conditions are met: 

 * Redistributions of source code must retain the above copyright notice, 
   this list of conditions and the following disclaimer. 
 * Redistributions in binary form must reproduce the above copyright 
   notice, this list of conditions and the following disclaimer in the 
   documentation and/or other materials provided with the distribution. 

THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND ANY 
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
DISCLAIMED. IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE FOR ANY 
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES 
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR 
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY 
OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH 
DAMAGE. 
*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import * as Redux from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import * as ReactRedux from 'react-redux';
import thunk from 'redux-thunk';
import Root from './components/Root';
import 'bulma/css/bulma.css';
import * as serviceWorker from './serviceWorker';

import { reducerIdeasOverview } from './reducers/reducerIdeasOverview';
import { reducerAuthentication } from "./reducers/reducerAuthentication";
import { reducerDetailPage } from "./reducers/reducerDetailPage";
import { reducerBoard } from "./reducers/reducerBoard";
import { reducerNotification } from "./reducers/reducerNotification";
import reducerCreateOrganisation from './reducers/reducerCreateOrganisation';
import { reducerTest } from "./reducers/reducerTest";

export const SERVER_PORT = process.env.REACT_APP_SERVER_PORT || 80;
export const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'localhost';
export const SERVER_PROTOCOL = process.env.REACT_APP_SERVER_PROTOCOL || 'http';
export const ENV = process.env.REACT_APP_ENV || 'dev';
export const OWN_URL = process.env.REACT_APP_OWN_URL || 'http://localhost:3000';
export const MAX_IMAGE_SIZE = process.env.REACT_APP_MAX_IMAGE_SIZE || 1000000;
export const APP_SERVER_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';


export const CONN_URL = `${SERVER_PROTOCOL}://${SERVER_URL}:${SERVER_PORT}`;

const logger = (store) => (next) => (action) => {
	console.log('ACTION:', action.type, action);
	let result = next(action);
	console.log('STATE AFTER ACTION:', action.type, store.getState());
	return result;
};

export const appReducer = Redux.combineReducers({
	ideasOverview: reducerIdeasOverview,
	authentication: reducerAuthentication,
	detailPage: reducerDetailPage,
	board: reducerBoard,
	notification: reducerNotification,
	createOrganisation: reducerCreateOrganisation,
	test: reducerTest
});

const mainReducer = (state, action) => {
	if (action.type === 'RESET') {
		state = undefined;
	}
	return appReducer(state, action)
}

export function resetStoreAction() {
	return { type: 'RESET' };
}

export const theStore = ENV === 'dev'
	? Redux.createStore(mainReducer, composeWithDevTools(Redux.applyMiddleware(thunk, logger)))
	: Redux.createStore(mainReducer, Redux.applyMiddleware(thunk));

const mainApp = (
	<ReactRedux.Provider store={theStore}>
		<BrowserRouter>
			<Root />
		</BrowserRouter>
	</ReactRedux.Provider>
);

ReactDOM.render(mainApp, document.getElementById('root') || document.createElement('div'));

serviceWorker.register();
