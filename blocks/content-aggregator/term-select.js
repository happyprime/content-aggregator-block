// WordPress dependencies.
import apiFetch from '@wordpress/api-fetch';

import { SelectControl } from '@wordpress/components';

import { useEffect, useState, useRef } from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

import { __ } from '@wordpress/i18n';

import { addQueryArgs } from '@wordpress/url';

/**
 * Retrieve the terms of the given taxonomy and
 * render them as `SelectControl` options.
 *
 * @param {Object} props Component properties.
 * @return {WPElement} SelectControl component.
 */
export default function TermSelect( props ) {
	const { onChange, selectedTerms, taxonomy } = props;

	const [ termsList, setTermsList ] = useState( [] );

	const isStillMounted = useRef();

	const restSlug = taxonomy.split( ',' )[ 1 ];

	useEffect( () => {
		isStillMounted.current = true;

		apiFetch( {
			path: addQueryArgs( `/wp/v2/${ restSlug }`, {
				per_page: -1,
			} ),
		} )
			.then( ( data ) => {
				if ( isStillMounted.current ) {
					const termData = data.map( ( term ) => {
						return {
							label: decodeEntities( term.name ),
							value: term.id,
						};
					} );

					setTermsList( termData );
				}
			} )
			.catch( () => {
				if ( isStillMounted.current ) {
					setTermsList( [] );
				}
			} );

		return () => {
			isStillMounted.current = false;
		};
	}, [ taxonomy ] );

	return (
		<SelectControl
			className="happyprime-block-cab_taxonomy-term-select"
			help={ __( 'Ctrl/Cmd + click to select/deselect multiple terms' ) }
			label={ __( 'Term(s)' ) }
			multiple
			onChange={ onChange }
			options={ termsList }
			value={ selectedTerms }
		/>
	);
}
