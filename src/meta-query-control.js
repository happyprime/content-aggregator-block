// WordPress dependencies.
import apiFetch from '@wordpress/api-fetch';

import { Button, RadioControl, SelectControl } from '@wordpress/components';

import { useEffect, useRef, useState } from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

import { __ } from '@wordpress/i18n';

import { cancelCircleFilled, plusCircle } from '@wordpress/icons';

import { addQueryArgs } from '@wordpress/url';

// Module constants.
const META_PARAMETERS_SETTING = {
	key: '',
	value: '',
	compare: '=',
	type: 'CHAR',
};

/**
 * Render controls for configuring meta query parameters.
 *
 * @param {Object} props Component properties.
 * @return {WPElement} MetaOrderControl component.
 */
export default function MetaOrderControl( props ) {
	const { blockProps } = props;

	const { attributes, setAttributes } = blockProps;

	const { customPostType, metaQuery = [], metaRelation } = attributes;

	const [ keyOptions, setKeyOptions ] = useState( [] );

	const isStillMounted = useRef();

	useEffect( () => {
		isStillMounted.current = true;

		apiFetch( {
			path: addQueryArgs( `/content-aggregator-block/v1/meta/`, {
				post_type: customPostType,
			} ),
		} )
			.then( ( data ) => {
				if ( isStillMounted.current ) {
					const keyData = data.map( ( key ) => {
						return {
							label: decodeEntities( key ),
							value: key,
						};
					} );

					setKeyOptions( keyData );
				}
			} )
			.catch( () => {
				if ( isStillMounted.current ) {
					setKeyOptions( [] );
				}
			} );

		return () => {
			isStillMounted.current = false;
		};
	}, [ customPostType ] );

	/**
	 * Handle updates to the meta query settings.
	 *
	 * @param {number}       index    The setting data index.
	 * @param {string}       property The property to update.
	 * @param {string|Array} value    Updated value to apply to the setting.
	 * @return {Array} The array with which to update the `metaQuery` attribute.
	 */
	const updatedParameters = ( index, property, value ) => {
		let parametersUpdate;

		if ( 'undefined' !== typeof metaQuery && metaQuery.length ) {
			parametersUpdate = Object.values( {
				...metaQuery,
				[ index ]: {
					...metaQuery[ index ],
					[ property ]: value,
				},
			} );
		}

		return parametersUpdate;
	};

	/**
	 * Display an individual array of meta query parameters.
	 *
	 * @param {Object} parameters The setting data.
	 * @param {number} index      The setting data index.
	 * @return {WPElement} Element to render.
	 */
	const parametersSetting = ( parameters, index ) => {
		return (
			<div className="happyprime-block-cab_meta-query-setting-wrapper">
				<Button
					className="happyprime-block-cab_meta-query-remove-setting"
					icon={ cancelCircleFilled }
					label={ __( 'Remove meta query parameters' ) }
					onClick={ () => {
						metaQuery.splice( index, 1 );

						setAttributes( {
							metaQuery: [ ...metaQuery ],
						} );

						if ( 1 <= metaQuery.length ) {
							setAttributes( { metaRelation: undefined } );
						}
					} }
				/>
				<div className="happyprime-block-cab_meta-query-setting">
					<SelectControl
						className="happyprime-block-cab_meta-query-key-select"
						label={ __( 'Key' ) }
						onChange={ ( value ) =>
							setAttributes( {
								metaQuery: updatedParameters(
									index,
									'key',
									value
								),
							} )
						}
						options={ keyOptions }
						value={ parameters.key ?? '' }
					/>
					<SelectControl
						className="happyprime-block-cab_meta-query-value-select"
						label={ __( 'Value' ) }
						onChange={ ( value ) =>
							setAttributes( {
								metaQuery: updatedParameters(
									index,
									'value',
									value
								),
							} )
						}
						options={ [
							{
								label: __( 'Current date/time' ),
								value: 'now',
							},
						] }
						value={ parameters.value ?? '' }
					/>
					<SelectControl
						className="happyprime-block-cab_meta-query-compare-select"
						label={ __( 'Compare' ) }
						onChange={ ( value ) =>
							setAttributes( {
								metaQuery: updatedParameters(
									index,
									'compare',
									value
								),
							} )
						}
						options={ [
							{
								label: __( '=' ),
								value: '=',
							},
							{
								label: __( '!=' ),
								value: '!=',
							},
							{
								label: __( '>' ),
								value: '>',
							},
							{
								label: __( '>=' ),
								value: '>=',
							},
							{
								label: __( '<' ),
								value: '<',
							},
							{
								label: __( '<=' ),
								value: '<=',
							},
							{
								label: __( 'Like' ),
								value: 'LIKE',
							},
							{
								label: __( 'Not Like' ),
								value: 'NOT LIKE',
							},
							{
								label: __( 'In' ),
								value: 'IN',
							},
							{
								label: __( 'Not In' ),
								value: 'NOT IN',
							},
							{
								label: __( 'Between' ),
								value: 'BETWEEN',
							},
							{
								label: __( 'Not Between' ),
								value: 'NOT BETWEEN',
							},
							{
								label: __( 'Exists' ),
								value: 'EXISTS',
							},
							{
								label: __( 'Not Exists' ),
								value: 'NOT EXISTS',
							},
						] }
						value={ parameters.compare }
					/>
					<SelectControl
						className="happyprime-block-cab_meta-query-type-select"
						label={ __( 'Type' ) }
						onChange={ ( value ) =>
							setAttributes( {
								metaQuery: updatedParameters(
									index,
									'type',
									value
								),
							} )
						}
						options={ [
							{
								label: __( 'Binary' ),
								value: 'BINARY',
							},
							{
								label: __( 'Char' ),
								value: 'CHAR',
							},
							{
								label: __( 'Date' ),
								value: 'DATE',
							},
							{
								label: __( 'DateTime' ),
								value: 'DATETIME',
							},
							{
								label: __( 'Decimal' ),
								value: 'DECIMAL',
							},
							{
								label: __( 'Numeric' ),
								value: 'NUMERIC',
							},
							{
								label: __( 'Signed' ),
								value: 'SIGNED',
							},
							{
								label: __( 'Time' ),
								value: 'TIME',
							},
							{
								label: __( 'Unsigned' ),
								value: 'UNSIGNED',
							},
						] }
						value={ parameters.type }
					/>
				</div>
			</div>
		);
	};

	return (
		<div className="happyprime-block-cab_meta-query-settings">
			<p>{ __( 'Meta Query Parameters' ) }</p>
			{ metaQuery &&
				0 < metaQuery.length &&
				metaQuery.map( ( parameters, index ) =>
					parametersSetting( parameters, index )
				) }
			<Button
				className="happyprime-block-cab_meta-query-add-setting"
				icon={ plusCircle }
				onClick={ () => {
					setAttributes( {
						metaQuery: metaQuery.concat( META_PARAMETERS_SETTING ),
					} );

					if ( metaQuery && 1 < metaQuery.length && ! metaRelation ) {
						setAttributes( {
							metaRelation: 'AND',
						} );
					}
				} }
				text={
					metaQuery && 0 < metaQuery.length
						? __( 'Add more meta query parameters' )
						: __( 'Add meta query parameters' )
				}
			/>
			{ metaQuery && 1 < metaQuery.length && (
				<div className="happyprime-block-cab_meta-query-relation">
					<p>{ __( 'Meta Query Relationship' ) }</p>
					<RadioControl
						label={ __( 'Show posts that match:' ) }
						selected={ metaRelation }
						options={ [
							{ label: __( 'All settings ("AND")' ), value: 'AND' },
							{ label: __( 'Any settings ("OR")' ), value: 'OR' },
						] }
						onChange={ ( option ) =>
							setAttributes( {
								metaRelation: option,
							} )
						}
					/>
				</div>
			) }
		</div>
	);
}
