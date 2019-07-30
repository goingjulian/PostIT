import React from 'react';
import { BeatLoader } from 'react-spinners';

export default function Loader(props) {
    return <section className="all-center">
        <BeatLoader size={12} color={'#000000'} />
        <p className="subtitle">{props.subtitle}</p>
    </section>
}