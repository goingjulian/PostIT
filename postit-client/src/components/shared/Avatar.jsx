import React from 'react';

/**
 *
 * @img Image of the user (link)
 * @link Link that refers to the user profile page (# if not desired)
 * @size Size of the avatar (Default 64x64)
 */
export default function Avatar(props) {
	return (
		<figure className={` ${props.location === 'nav' ? 'image is-24x24':'image is-64x64'}`}>
			<img src={props.imgURL || '/media/images/person.png'} alt="User" className="is-rounded" />
		</figure>
	);
}
