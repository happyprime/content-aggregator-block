// External dependencies
import classnames from 'classnames';

// WordPress dependencies
import apiFetch from '@wordpress/api-fetch';

import { registerBlockType } from '@wordpress/blocks';

import {
	InspectorControls,
	BlockControls,
	useBlockProps,
} from '@wordpress/block-editor';

import {
	Button,
	Disabled,
	PanelBody,
	Placeholder,
	RangeControl,
	RadioControl,
	SelectControl,
	Spinner,
	ToggleControl,
	ToolbarGroup,
} from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import {
	dateI18n,
	format,
	__experimentalGetSettings, // Used to retrieve date format, watch for deprecation.
} from '@wordpress/date';

import {
	Fragment,
	RawHTML,
	useEffect,
	useRef,
	useState,
} from '@wordpress/element';

import { applyFilters } from '@wordpress/hooks';

import { __ } from '@wordpress/i18n';

import {
	cancelCircleFilled,
	grid,
	list,
	pin,
	plusCircle,
} from '@wordpress/icons';

import { SVG, Path } from '@wordpress/primitives';

import { addQueryArgs } from '@wordpress/url';

// Internal dependencies
import TermSelect from './term-select';

import './editor.scss';

// Module constants
const COMMON_ARGS = { per_page: -1 };

const MAX_POSTS_COLUMNS = 6;

const TAXONOMY_SETTING = {
	slug: '',
	terms: [],
	operator: 'IN',
};

// Block registration
registerBlockType( 'happyprime/content-aggregator', {
	icon: (
		<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<Path d="M11 7h6v2h-6zM11 11h6v2h-6zM11 15h6v2h-6zM7 7h2v2H7zM7 11h2v2H7zM7 15h2v2H7z" />
			<Path d="M20.1 3H3.9c-.5 0-.9.4-.9.9v16.2c0 .4.4.9.9.9h16.2c.4 0 .9-.5.9-.9V3.9c0-.5-.5-.9-.9-.9zM19 19H5V5h14v14z" />
		</SVG>
	),

	edit( props ) {
		const { attributes, setAttributes } = props;

		const {
			itemCount,
			customPostType,
			taxonomies,
			taxRelation,
			order,
			orderBy,
			displayPostDate,
			postLayout,
			columns,
			displayPostContent,
			postContent,
			excerptLength,
			displayImage,
			imageSize,
			stickyPosts,
		} = attributes;

		// Get the selected post type slug.
		const postTypeSlug = customPostType.split( ',' )[ 0 ];

		// Set up options.
		const {
			postTypeOptions,
			taxonomyOptions,
			imageSizeOptions,
		} = useSelect(
			( select ) => {
				const { getPostTypes, getTaxonomies } = select( 'core' );
				const postTypes = getPostTypes( COMMON_ARGS );
				const allTaxonomies = getTaxonomies( COMMON_ARGS );
				const imageSizes = select( 'core/block-editor' ).getSettings()
					.imageSizes;
				const postTypeOptions = [];
				const taxonomyOptions = [];
				const imageSizeOptions = [];
				// Exclude `attachment` from the post type options. Filtered to allow customization.
				const excludeTypes = applyFilters(
					'contentAggregatorBlock.ExcludePostTypes',
					[ 'attachment' ]
				);

				// Populate post type and taxonomy options.
				if ( postTypes ) {
					postTypes.forEach( ( type ) => {
						if (
							type.viewable &&
							type.rest_base &&
							! excludeTypes.includes( type.slug )
						) {
							postTypeOptions.push( {
								label: type.labels.singular_name,
								value: type.slug,
							} );

							if (
								postTypeSlug === type.slug &&
								type.taxonomies.length &&
								allTaxonomies
							) {
								taxonomyOptions.push( {
									label: __( 'None' ),
									value: '',
								} );

								allTaxonomies.forEach( ( tax ) => {
									if (
										tax.visibility.public &&
										type.taxonomies.includes( tax.slug )
									) {
										taxonomyOptions.push( {
											label: tax.name,
											value:
												tax.slug + ',' + tax.rest_base,
										} );
									}
								} );
							}
						}
					} );
				}

				// Populate image size options.
				if ( imageSizes ) {
					imageSizes.forEach( ( size ) => {
						imageSizeOptions.push( {
							value: size.slug,
							label: size.name,
						} );
					} );
				}

				return {
					postTypeOptions,
					taxonomyOptions,
					imageSizeOptions,
				};
			},
			[ postTypeSlug ]
		);

		// Initialize a state for managing the posts to display.
		// This gets set as an array, but is intentionally initialized with a different type
		// so that the `<Spinner>` displays instead of the `No items` message on mount.
		const [ latestPosts, setLatestPosts ] = useState( '' );

		const isStillMounted = useRef();

		useEffect( () => {
			isStillMounted.current = true;

			const postsFetchData = {
				post_type: postTypeSlug,
				per_page: itemCount,
				order: order,
				orderby: orderBy,
			};

			if (
				cabStickyPostSupport.includes( postTypeSlug ) &&
				stickyPosts
			) {
				postsFetchData[ 'sticky_posts' ] = true;
			}

			if ( taxonomies ) {
				postsFetchData[ 'taxonomies' ] = taxonomies;

				if ( taxRelation ) {
					postsFetchData[ 'tax_relation' ] = taxRelation;
				}
			}

			apiFetch( {
				path: addQueryArgs(
					'/content-aggregator-block/v1/posts/',
					postsFetchData
				),
			} )
				.then( ( data ) => {
					if ( isStillMounted.current ) {
						setLatestPosts( data );
					}
				} )
				.catch( () => {
					if ( isStillMounted.current ) {
						setLatestPosts( [] );
					}
				} );

			// Handle deprecated taxonomy attributes if needed.
			if (
				isStillMounted.currrent &&
				( attributes.customTaxonomy || attributes.termID )
			) {
				const taxonomy = [
					{
						slug: attributes.customTaxonomy,
						terms: [ `${ attributes.termID }` ],
					},
				];

				setAttributes( {
					taxonomies: taxonomy,
					customTaxonomy: undefined,
					termID: undefined,
				} );
			}

			return () => {
				isStillMounted.current = false;
			};
		}, [
			itemCount,
			order,
			orderBy,
			postTypeSlug,
			stickyPosts,
			taxonomies,
		] );

		const hasPosts = Array.isArray( latestPosts ) && latestPosts.length;

		const blockProps = useBlockProps( {
			className: classnames( {
				'wp-block-latest-posts': true,
				'happyprime-block-content-aggregator-block_error': ! hasPosts,
				'has-dates': displayPostDate,
				'is-grid': postLayout === 'grid',
				[ `columns-${ columns }` ]: postLayout === 'grid',
			} ),
		} );

		/**
		 * Handle updates to the taxonomy settings.
		 *
		 * @param {number} index    The setting data index.
		 * @param {string} property The property to update.
		 * @param {mixed} value     Updated value to apply to the setting.
		 * @returns The array with which to update the `taxonomies` attribute.
		 */
		const updatedTaxonomies = ( index, property, value ) => {
			let taxonomiesUpdate = Object.values( {
				...taxonomies,
				[ index ]: {
					...taxonomies[ index ],
					[ property ]: value,
				},
			} );

			// Resets the `terms` and `operator` properties when the slug is changed.
			if (
				'slug' === property &&
				taxonomies[ index ] &&
				value !== taxonomies[ index ].slug
			) {
				taxonomiesUpdate = Object.values( {
					...taxonomiesUpdate,
					[ index ]: {
						...taxonomiesUpdate[ index ],
						terms: [],
						operator: undefined,
					},
				} );
			}

			// Handles changes to the `operator` property when terms are changed.
			if ( 'terms' === property ) {
				const operatorValue =
					! taxonomies[ index ].operator && 1 < value.length
						? 'IN'
						: 1 < value.length
						? taxonomies[ index ].operator
						: undefined;

				taxonomiesUpdate = Object.values( {
					...taxonomiesUpdate,
					[ index ]: {
						...taxonomiesUpdate[ index ],
						operator: operatorValue,
					},
				} );
			}

			return taxonomiesUpdate;
		};

		/**
		 * Display an individual taxonomy setting.
		 *
		 * @param {Object} taxonomy The setting data.
		 * @param {number} index    The setting data index.
		 * @returns Setting markup.
		 */
		const taxonomySetting = ( taxonomy, index ) => {
			return (
				<div className="happyprime-block-content-aggregator-block_taxonomy-setting-wrapper">
					{ 0 < index && (
						<Button
							className="happyprime-block-content-aggregator-block_remove-taxonomy-setting"
							icon={ cancelCircleFilled }
							label={ __( 'Remove taxonomy setting' ) }
							onClick={ () => {
								taxonomies.splice( index, 1 );

								setAttributes( {
									taxonomies: [ ...taxonomies ],
								} );

								if ( 1 === taxonomies.length ) {
									setAttributes( { taxRelation: undefined } );
								}
							} }
						/>
					) }
					<div className="happyprime-block-content-aggregator-block_taxonomy-setting">
						<SelectControl
							label={ __( 'Taxonomy' ) }
							value={ taxonomy.slug ? taxonomy.slug : '' }
							options={ taxonomyOptions }
							onChange={ ( value ) => {
								if ( '' === value ) {
									if ( 1 === taxonomies.length ) {
										setAttributes( { taxonomies: [] } );
									} else {
										taxonomies.splice( index, 1 );

										setAttributes( {
											taxonomies: [ ...taxonomies ],
										} );
									}
								} else {
									setAttributes( {
										taxonomies: updatedTaxonomies(
											index,
											'slug',
											value
										),
									} );
								}
							} }
						/>
						{ taxonomy.slug !== '' && (
							<TermSelect
								onChange={ ( value ) =>
									setAttributes( {
										taxonomies: updatedTaxonomies(
											index,
											'terms',
											value
										),
									} )
								}
								selectedTerms={ taxonomy.terms }
								taxonomy={ taxonomy.slug }
							/>
						) }
						{ taxonomy.terms && 1 < taxonomy.terms.length && (
							<RadioControl
								value={ taxonomy.operator }
								label={ __( 'Show posts with:' ) }
								selected={ taxonomy.operator }
								options={ [
									{
										label: __( 'Any selected terms' ),
										value: 'IN',
									},
									{
										label: __( 'All selected terms' ),
										value: 'AND',
									},
								] }
								onChange={ ( value ) =>
									setAttributes( {
										taxonomies: updatedTaxonomies(
											index,
											'operator',
											value
										),
									} )
								}
							/>
						) }
					</div>
				</div>
			);
		};

		// Inspector controls markup.
		const inspectorControls = (
			<InspectorControls>
				<PanelBody
					title={ __( 'Sorting and Filtering' ) }
					className="panelbody-custom-latest-posts"
				>
					<SelectControl
						key="query-controls-order-select"
						label={ __( 'Order by' ) }
						value={ `${ orderBy }/${ order }` }
						options={ [
							{
								label: __( 'Newest to Oldest' ),
								value: 'date/desc',
							},
							{
								label: __( 'Oldest to Newest' ),
								value: 'date/asc',
							},
							{
								label: __( 'A → Z' ),
								value: 'title/asc',
							},
							{
								label: __( 'Z → A' ),
								value: 'title/desc',
							},
							{
								label: __( 'Random' ),
								value: 'rand/desc',
							},
						] }
						onChange={ ( value ) => {
							const [ newOrderBy, newOrder ] = value.split( '/' );
							let atts = {};

							if ( newOrder !== order ) {
								atts.order = newOrder;
							}

							if ( newOrderBy !== orderBy ) {
								atts.orderBy = newOrderBy;
							}

							if ( atts.order || atts.orderBy ) {
								setAttributes( atts );
							}
						} }
					/>
					<RangeControl
						label={ __( 'Number of items' ) }
						value={ itemCount }
						onChange={ ( value ) => {
							setAttributes( { itemCount: Number( value ) } );
						} }
						min={ 1 }
						max={ 100 }
					/>
					<SelectControl
						label={ __( 'Post Type' ) }
						value={ customPostType }
						options={ postTypeOptions }
						onChange={ ( customPostType ) => {
							setAttributes( {
								customPostType,
								taxonomies: [],
							} );
						} }
					/>
					{ cabStickyPostSupport.includes(
						customPostType.split( ',' )[ 0 ]
					) &&
						'date' === orderBy && (
							<ToggleControl
								label={ __(
									'Show sticky posts at the start of the set'
								) }
								checked={ stickyPosts }
								onChange={ ( value ) => {
									setAttributes( { stickyPosts: value } );
								} }
							/>
						) }
					<div className="happyprime-block-content-aggregator-block_taxonomy">
						{ taxonomies && 1 < taxonomies.length && (
							<p>{ __( 'Taxonomy Settings' ) }</p>
						) }
						<div className="happyprime-block-content-aggregator-block_taxonomy-settings">
							{ taxonomies && 0 < taxonomies.length
								? taxonomies.map( ( taxonomy, index ) =>
										taxonomySetting( taxonomy, index )
								  )
								: taxonomySetting( TAXONOMY_SETTING, 0 ) }
						</div>
						{ taxonomies && 1 < taxonomies.length && (
							<RadioControl
								label={ __( 'Taxonomy Relation' ) }
								selected={ taxRelation }
								options={ [
									{ label: __( 'And' ), value: 'AND' },
									{ label: __( 'Or' ), value: 'OR' },
								] }
								onChange={ ( option ) =>
									setAttributes( {
										taxRelation: option,
									} )
								}
							/>
						) }
						{ taxonomies &&
							0 < taxonomies.length &&
							taxonomies[ 0 ].terms &&
							0 < taxonomies[ 0 ].terms.length && (
								<Button
									icon={ plusCircle }
									label={ __( 'Add more taxonomy settings' ) }
									onClick={ () => {
										setAttributes( {
											taxonomies: taxonomies.concat(
												TAXONOMY_SETTING
											),
										} );

										if ( ! taxRelation ) {
											setAttributes( {
												taxRelation: 'AND',
											} );
										}
									} }
									text={ __( 'Add more taxonomy settings' ) }
								/>
							) }
					</div>
					{ postLayout === 'grid' && (
						<RangeControl
							label={ __( 'Columns' ) }
							value={ columns }
							onChange={ ( value ) =>
								setAttributes( { columns: value } )
							}
							min={ 2 }
							max={
								! hasPosts
									? MAX_POSTS_COLUMNS
									: Math.min(
											MAX_POSTS_COLUMNS,
											latestPosts.length
									  )
							}
							required
						/>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Post Content Settings' ) }
					className="panelbody-custom-latest-posts"
				>
					<ToggleControl
						label={ __( 'Display post date' ) }
						checked={ displayPostDate }
						onChange={ ( value ) =>
							setAttributes( { displayPostDate: value } )
						}
					/>
					<ToggleControl
						label={ __( 'Display post content' ) }
						checked={ displayPostContent }
						onChange={ ( value ) =>
							setAttributes( { displayPostContent: value } )
						}
					/>
					{ displayPostContent && (
						<RadioControl
							label={ __( 'Show' ) }
							selected={ postContent }
							options={ [
								{
									label: __( 'Excerpt' ),
									value: 'excerpt',
								},
								{
									label: __( 'Full Post' ),
									value: 'full_post',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { postContent: value } )
							}
						/>
					) }
					{ displayPostContent && postContent === 'excerpt' && (
						<RangeControl
							label={ __( 'Max number of words in excerpt' ) }
							value={ excerptLength }
							onChange={ ( value ) =>
								setAttributes( { excerptLength: value } )
							}
							min={ 10 }
							max={ 100 }
						/>
					) }
					<ToggleControl
						label={ __( 'Display featured image' ) }
						checked={ displayImage }
						onChange={ ( value ) =>
							setAttributes( { displayImage: value } )
						}
					/>
					{ displayImage && (
						<SelectControl
							label={ __( 'Image size' ) }
							selected={ imageSize }
							options={ imageSizeOptions }
							onChange={ ( value ) =>
								setAttributes( { imageSize: value } )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>
		);

		// Return early if there are no posts to show.
		if ( ! hasPosts ) {
			return (
				<div { ...blockProps }>
					{ inspectorControls }
					<Placeholder
						icon={ pin }
						label={ __( 'Content Aggregator' ) }
					>
						{ ! Array.isArray( latestPosts ) ? (
							<Spinner />
						) : (
							__( 'No current items.' )
						) }
					</Placeholder>
				</div>
			);
		}

		// Removing posts from display should be instant.
		const displayPosts =
			latestPosts.length > itemCount
				? latestPosts.slice( 0, itemCount )
				: latestPosts;

		/**
		 * Display an individual item.
		 *
		 * @param {Object} post Post data to display.
		 * @returns Item markup.
		 */
		const displayListItem = ( post ) => {
			const titleTrimmed = post.title.trim();

			const excerptElement = document.createElement( 'div' );

			excerptElement.innerHTML = post.excerpt;

			const excerpt =
				excerptElement.textContent || excerptElement.innerText || '';

			const item = (
				<li>
					<Disabled>
						<a
							href={ post.link }
							target="_blank"
							rel="noreferrer noopener"
						>
							{ titleTrimmed ? (
								<RawHTML>{ titleTrimmed }</RawHTML>
							) : (
								__( '(Untitled)' )
							) }
						</a>
					</Disabled>
					{ displayPostDate && post.date_gmt && (
						<time
							dateTime={ format( 'c', post.date_gmt ) }
							className="wp-block-latest-posts__post-date"
						>
							{ dateI18n(
								__experimentalGetSettings().formats.date,
								post.date_gmt
							) }
						</time>
					) }
					{ displayImage && post.image[ imageSize ] && (
						<img src={ post.image[ imageSize ] } />
					) }
					{ displayPostContent && postContent === 'excerpt' && (
						<div className="wp-block-latest-posts__post-excerpt">
							<RawHTML key="html">
								{ excerptLength <
								excerpt.trim().split( ' ' ).length
									? excerpt
											.trim()
											.split( ' ', excerptLength )
											.join( ' ' ) + '…'
									: excerpt
											.trim()
											.split( ' ', excerptLength )
											.join( ' ' ) }
							</RawHTML>
						</div>
					) }
					{ displayPostContent && postContent === 'full_post' && (
						<div className="wp-block-latest-posts__post-full-content">
							<RawHTML key="html">
								{ post.content.trim() }
							</RawHTML>
						</div>
					) }
				</li>
			);

			return applyFilters(
				'contentAggregatorBlock.itemHTML',
				item,
				post,
				attributes
			);
		};

		return (
			<Fragment>
				{ inspectorControls }
				<BlockControls>
					<ToolbarGroup
						controls={ [
							{
								icon: list,
								title: __( 'List View' ),
								onClick: () =>
									setAttributes( { postLayout: 'list' } ),
								isActive: postLayout === 'list',
							},
							{
								icon: grid,
								title: __( 'Grid View' ),
								onClick: () =>
									setAttributes( { postLayout: 'grid' } ),
								isActive: postLayout === 'grid',
							},
						] }
					/>
				</BlockControls>
				<ul { ...blockProps }>
					{ displayPosts.map( ( post ) => displayListItem( post ) ) }
				</ul>
			</Fragment>
		);
	},

	save() {
		return null;
	},
} );
