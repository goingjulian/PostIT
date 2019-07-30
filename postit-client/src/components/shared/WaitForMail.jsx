import React from 'react';

export default function WaitForMail(props) {
    return (
        <div className='container' id='waitForMail'>
            <h1 className='title'>Success!</h1>
            <h2>Please click on the link in the e-mail sent to {props.email ? <strong>{props.email}</strong> : 'the specified e-mail address'}</h2>
            <i className='fas fa-envelope-open fa-10x is-center' />
        </div>
    );
}