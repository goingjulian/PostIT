import React from 'react';
import { Link } from "react-router-dom";

export default function ErrorPage(props) {
    return <section id="error">
        <div className="container">
            <div className="content">
                <h3 className="title is-1">404</h3>
                <p className="subtitle is-5">
                    {
                        props.errorMessage
                            ? props.errorMessage :
                            "Oops, We have no idea what you were looking for."
                    }
                </p>
                <div className="field is-grouped is-grouped-centered">
                    <p className="control">
                        <Link to="/home" className="button cta-green">
                            Create your own organisation
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    </section>
}
