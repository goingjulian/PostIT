import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export default ({ isAllowed, redirect, ...props }) => {
    return isAllowed ? <Route {...props} /> : <Redirect to={redirect} />
}