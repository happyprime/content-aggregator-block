// WordPress dependencies
import { registerBlockType } from '@wordpress/blocks';

import { SVG, Path } from '@wordpress/primitives';

// Internal dependencies
import edit from './edit';

import transforms from './transforms';

// Block registration
registerBlockType('happyprime/content-aggregator', {
	icon: (
		<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<Path d="M11 7h6v2h-6zM11 11h6v2h-6zM11 15h6v2h-6zM7 7h2v2H7zM7 11h2v2H7zM7 15h2v2H7z" />
			<Path d="M20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z" />
		</SVG>
	),

	transforms,

	edit,
});
