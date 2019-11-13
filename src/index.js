import classnames from 'classnames';

const {
	__,
} = wp.i18n;

const {
	registerBlockType,
} = wp.blocks;

const {
	withState,
	compose,
} = wp.compose;

const {
	withSelect,
	select,
} = wp.data;

const {
	Fragment,
	RawHTML,
} = wp.element;

const {
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
	Toolbar,
	RangeControl,
	RadioControl,
	IconButton,
	Spinner,
} = wp.components;

const {
	InspectorControls,
	BlockControls,
} = wp.editor;

const {
	addQueryArgs,
} = wp.url;

const {
	dateI18n,
	format,
	__experimentalGetSettings, // Used to retrieve date format, watch for deprecation.
} = wp.date;

const {
	apiFetch,
} = wp;

const MAX_POSTS_COLUMNS = 6;

const TAXONOMY_SETTING = {
	slug: '',
	terms: [],
	operator: 'IN',
};

// Register the block.
registerBlockType( 'happyprime/latest-custom-posts', {

	title: __( 'Latest Custom Posts' ),

	description: __( 'A list of posts for a custom post type and/or taxonomy.' ),

	icon: <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false"><path d="M0,0h24v24H0V0z" fill="none"></path><rect x="11" y="7" width="6" height="2"></rect><rect x="11" y="11" width="6" height="2"></rect><rect x="11" y="15" width="6" height="2"></rect><rect x="7" y="7" width="2" height="2"></rect><rect x="7" y="11" width="2" height="2"></rect><rect x="7" y="15" width="2" height="2"></rect><path d="M20.1,3H3.9C3.4,3,3,3.4,3,3.9v16.2C3,20.5,3.4,21,3.9,21h16.2c0.4,0,0.9-0.5,0.9-0.9V3.9C21,3.4,20.5,3,20.1,3z M19,19H5V5h14V19z"></path></svg>,

	category: 'widgets',

	keywords: [
		__( 'recent posts' ),
		__( 'custom posts' ),
	],

	supports: {
		align: true,
		html: false,
	},

	attributes: {
		customPostType: {
			type: 'string',
			default: 'post,posts',
		},
		customTaxonomy: {
			type: 'array',
			default: [],
		},
		taxRelation: {
			type: 'string',
			default: 'AND',
		},
		itemCount: {
			type: 'integer',
			default: 3,
		},
		order: {
			type: 'string',
			default: 'desc',
		},
		orderBy: {
			type: 'string',
			default: 'date',
		},
		displayPostDate: {
			type: 'boolean',
			default: false
		},
		postLayout: {
			type: 'string',
			default: 'list',
		},
		columns: {
			type: 'integer',
			default: 2,
		},
	},

	edit: compose( [
		withState( {
			latestPosts: [],
			latestPostsError: false,
			doingLatestPostsFetch: false,
			triggerRefresh: true,
			taxonomyTerms: [],
			triggerTermsRefresh: true,
			doingTermsFetch: false,
			errorMessage : false,
		} ),
		withSelect( ( select, props ) => {
			const {
				setState,
				latestPosts,
				doingLatestPostsFetch,
				triggerRefresh,
				taxonomyTerms,
				doingTermsFetch,
				triggerTermsRefresh,
				errorMessage,
			} = props;

			const {
				customPostType,
				customTaxonomy,
				itemCount,
				taxRelation,
				order,
				orderBy,
			} = props.attributes;

			let postID = select( 'core/editor' ).getCurrentPostId();

			let doRequest     = false;
			let doTermRequest = false;

			if ( triggerRefresh && false === doingLatestPostsFetch ) {
				doRequest = true;
			}

			if ( triggerTermsRefresh && false === doingTermsFetch ) {
				doTermRequest = true;
			}

			if ( postID && customTaxonomy && 0 < customTaxonomy.length && doTermRequest ) {
				setState( {
					doingTermsFetch: true,
					triggerTermsRefresh: false,
				} );

				let terms = [];

				customTaxonomy.forEach( ( taxonomy, index ) => {

					const restSlug = taxonomy.slug.split( ',' )[1];

					if ( undefined === typeof restSlug ) {
						setState( { doingTermsFetch: false } );
					}

					apiFetch( {
						path: addQueryArgs( '/wp/v2/' + restSlug, { per_page: 100 } ),
					} ).then( data => {
						const termData = data.map( term => {
							return {
								label: term.name,
								value: term.id,
							}
						} );

						Object.assign( terms, { [ index ]: termData } );
					} ).catch( error => {
						setState( { errorMessage: error.message } );
					} );
				} );

				setState( {
					taxonomyTerms: terms,
					doingTermsFetch: false,
				} );
			}

			if ( postID && '' !== customPostType && doRequest ) {
				setState( {
					doingLatestPostsFetch: true,
					triggerRefresh: false,
				} );

				let fetchData = {
					post_type: customPostType.split( ',' )[0],
					per_page: itemCount,
					order: order,
					orderby: orderBy,
				};

				if ( customTaxonomy ) {
					fetchData['taxonomies'] = customTaxonomy;

					if ( taxRelation ) {
						fetchData['tax_relation'] = taxRelation;
					}
				}

				console.log( addQueryArgs( '/lcp/v1/posts/', fetchData ) );

				apiFetch( {
					path: addQueryArgs( '/lcp/v1/posts/', fetchData ),
				} ).then( data => {
					setState( {
						latestPosts: data,
						doingLatestPostsFetch: false,
					} );
				} ).catch( error => {
					setState( {
						errorMessage: error.message,
						latestPosts: [],
						doingLatestPostsFetch: false,
					} );
				} );
			}

			return {
				posts: latestPosts,         // Full post objects to display in the block.
				terms: taxonomyTerms,
				errorMessage: errorMessage, // A string to display in the block if an API request failed.
			};
		} ),
	] )( ( { posts, terms, errorMessage, attributes, ...props } ) => {
		const {
			setAttributes,
			setState,
			className,
		} = props;

		const {
			itemCount,
			customPostType,
			customTaxonomy,
			taxRelation,
			order,
			orderBy,
			displayPostDate,
			postLayout,
			columns,
		} = attributes;

		let displayPosts;

		// Ensure the number of posts is limited to the expected number of posts.
		if ( posts.length > itemCount ) {
			displayPosts = posts.slice( 0, itemCount );
		} else {
			displayPosts = posts;
		}

		let currentTypes      = select( 'core' ).getPostTypes();
		let currentTaxonomies = select( 'core' ).getTaxonomies();
		let postTypeOptions   = [];
		let taxonomySlugs     = [];
		let taxonomyOptions   = [ { label: 'None', value: '' } ];

		if ( null === currentTypes ) {
			currentTypes = [];
		}

		if ( null === currentTaxonomies ) {
			currentTaxonomies = [];
		}

		currentTypes.forEach( function( type ) {
			if ( type.viewable && type.rest_base ) {
				postTypeOptions.push( { label: type.name, value: type.slug + ',' + type.rest_base } );
			}

			let customPostTypeSlug = customPostType.split( ',' )[0];

			if ( customPostTypeSlug === type.slug ) {
				type.taxonomies.forEach( function( tax ) {
					taxonomySlugs.push( tax );
				} );
			}
		} );

		currentTaxonomies.forEach( function( tax ) {
			if ( tax.visibility.public && taxonomySlugs.includes( tax.slug ) ) {
				taxonomyOptions.push( { label: tax.name, value: tax.slug + ',' + tax.rest_base } );
			}
		} );

		const layoutControls = [
			{
				icon: 'list-view',
				title: __( 'List View' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
			{
				icon: 'grid-view',
				title: __( 'Grid View' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
		];

		const displayListItem = ( post ) => {
			const titleTrimmed = post.title.trim();

			return (
				<li>
					<a href={ post.link } target="_blank" rel="noreferrer noopener">
						{ titleTrimmed ? (
							<RawHTML>
								{ titleTrimmed }
							</RawHTML>
						) :
							__( '(Untitled)' )
						}
					</a>
					{ displayPostDate && post.date_gmt &&
						<time dateTime={ format( 'c', post.date_gmt ) } className="wp-block-latest-posts__post-date">
							{ dateI18n( __experimentalGetSettings().formats.date, post.date_gmt ) }
						</time>
					}
				</li>
			);
		};

		const updatedCustomTaxonomy = ( index, property, value ) => {
			let customTaxonomyUpdates = Object.values( {
				...customTaxonomy,
				[ index ]: {
					...customTaxonomy[ index ],
					[ property ]: value,
				}
			} );

			// Resets the `terms` and `operator` properties when the slug is changed.
			if ( 'slug' === property && customTaxonomy[ index ] && value !== customTaxonomy[ index ].slug ) {
				customTaxonomyUpdates = Object.values( {
					...customTaxonomyUpdates,
					[ index ]: {
						...customTaxonomyUpdates[ index ],
						terms: [],
						operator: undefined,
					}
				} );
			}

			// Handles changes to the `operator` property when terms are changed.
			if ( 'terms' === property ) {
				const operatorValue = ( !customTaxonomy[ index ].operator && 1 < value.length )
					? 'IN'
					: ( 1 < value.length )
						? customTaxonomy[ index ].operator
						: undefined;

				customTaxonomyUpdates = Object.values( {
					...customTaxonomyUpdates,
					[ index ]: {
						...customTaxonomyUpdates[ index ],
						operator: operatorValue,
					}
				} );
			}

			return customTaxonomyUpdates;
		}

		const taxonomySetting = ( taxonomy, index ) => {
			return (
				<div className="happyprime-block-latest-custom-posts_taxonomy-setting-wrapper">
					{ 0 < index && (
						<IconButton
							className="happyprime-block-latest-custom-posts_remove-taxonomy-setting"
							icon="dismiss"
							label={ __( 'Remove taxonomy setting' ) }
							onClick={ () => {
								customTaxonomy.splice( index, 1 );

								setAttributes( { customTaxonomy: [ ...customTaxonomy ] } );

								if ( 1 === customTaxonomy.length ) {
									setAttributes( { taxRelation: undefined } );
								}

								setState( {
									triggerRefresh: true,
									latestPosts: [],
								} );
							} }
						/>
					) }
					<div className="happyprime-block-latest-custom-posts_taxonomy-setting">
						<SelectControl
							label="Taxonomy"
							value={ ( taxonomy.slug ) ? taxonomy.slug : '' }
							options={ taxonomyOptions }
							onChange={ ( value ) => {
								if ( '' === value ) {
									if ( 1 === customTaxonomy.length ) {
										setAttributes( { customTaxonomy: [] } );
									} else {
										customTaxonomy.splice( index, 1 );

										setAttributes( { customTaxonomy: [ ...customTaxonomy ] } );
									}
								} else {
									setAttributes( { customTaxonomy: updatedCustomTaxonomy( index, 'slug', value ) } );
									setState( {
										triggerTermsRefresh: true,
										taxonomyTerms: Object.assign( terms, { [ index ]: [] } ),
									} );
								}

								setState( {
									triggerRefresh: true,
									latestPosts: [],
								} );
							} }
						/>
						{ ( taxonomy.slug !== '' && terms[ index ] && 0 < terms[ index ].length ) && (
							<SelectControl
								multiple
								label="Term(s)"
								help="Cmd or Ctrl + click to select multiple terms"
								value={ taxonomy.terms }
								options={ terms[ index ] }
								onChange={ ( value ) => {
									setAttributes( { customTaxonomy: updatedCustomTaxonomy( index, 'terms', value ) } );
									setState( {
										triggerRefresh: true,
										latestPosts: [],
									} );
								} }
							/>
						) }
						{ ( taxonomy.terms && 1 < taxonomy.terms.length ) && (
							<RadioControl
								value={ taxonomy.operator }
								label="Show posts with:"
								selected={ taxonomy.operator }
								options={ [
									{ label: 'Any selected terms', value: 'IN' },
									{ label: 'All selected terms', value: 'AND' },
								] }
								onChange={ ( value ) => {
									setAttributes( { customTaxonomy: updatedCustomTaxonomy( index, 'operator', value ) } );
									setState( {
										triggerRefresh: true,
										latestPosts: [],
									} );
								} }
							/>
						) }
					</div>
				</div>
			);
		}

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody
						title={ __( 'Settings' ) }
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
									/* translators: label for ordering posts by title in ascending order */
									label: __( 'A → Z' ),
									value: 'title/asc',
								},
								{
									/* translators: label for ordering posts by title in descending order */
									label: __( 'Z → A' ),
									value: 'title/desc',
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
									setState( {
										triggerRefresh: true,
										latestPosts: []
									} );
								}
							} }
						/>
						<ToggleControl
							label={ __( 'Display post date' ) }
							checked={ displayPostDate }
							onChange={ ( value ) => setAttributes( { displayPostDate: value } ) }
						/>
						<TextControl
							label="Number of items"
							value={ itemCount }
							onChange={ ( value ) => {
								setAttributes( { itemCount: Number( value ) } );
								setState( {
									triggerRefresh: true,
									latestPosts: []
								} );
							} }
						/>
						<SelectControl
							label="Post Type"
							value={ customPostType }
							options={ postTypeOptions }
							onChange={ ( customPostType ) => {
								setAttributes( {
									customPostType,
									customTaxonomy: [],
								} );
								setState( {
									triggerRefresh: true,
									latestPosts: [],
									taxonomyTerms: [],
								} );
							} }
						/>
						<div className="happyprime-block-latest-custom-posts_taxonomy">
							{ ( customTaxonomy && 1 < customTaxonomy.length ) && (
								<p>{ __( 'Taxonomy Settings' ) }</p>
							) }
							<div className="happyprime-block-latest-custom-posts_taxonomy-settings">
								{ ( customTaxonomy && 0 < customTaxonomy.length ) ? (
									customTaxonomy.map( ( taxonomy, index ) => taxonomySetting( taxonomy, index ) )
								) : (
									taxonomySetting( TAXONOMY_SETTING, 0 )
								) }
							</div>
							{ ( customTaxonomy && 1 < customTaxonomy.length ) && (
								<RadioControl
									label={ __( 'Relation' ) }
									selected={ taxRelation }
									options={ [
										{ label: __( 'And' ), value: 'AND' },
										{ label: __( 'Or' ), value: 'OR' },
									] }
									onChange={ ( option ) => {
										setAttributes( { taxRelation: option } );
										setState( {
											triggerRefresh: true,
											latestPosts: [],
										} );
									} }
								/>
							) }
							{ ( customTaxonomy && 0 < customTaxonomy.length && customTaxonomy[0].terms && 0 < customTaxonomy[0].terms.length ) && (
								<IconButton
									icon="plus-alt"
									label={ __( 'Add more taxonomy settings' ) }
									onClick={ () => {
										setAttributes( { customTaxonomy: customTaxonomy.concat( TAXONOMY_SETTING ) } );

										if ( !taxRelation ) {
											setAttributes( { taxRelation: 'AND' } )
										}
									} }
								>{ __( 'Add more taxonomy settings' ) }</IconButton>
							) }
						</div>
						{ postLayout === 'grid' &&
							<RangeControl
								label={ __( 'Columns' ) }
								value={ columns }
								onChange={ ( value ) => setAttributes( { columns: value } ) }
								min={ 2 }
								max={ 0 === displayPosts.length ? MAX_POSTS_COLUMNS : Math.min( MAX_POSTS_COLUMNS, displayPosts.length ) }
								required
							/>
						}
					</PanelBody>
				</InspectorControls>
				<BlockControls>
					<Toolbar controls={ layoutControls } />
				</BlockControls>
				{ displayPosts && displayPosts.length > 0 ? (
					<ul
						className={ classnames( className, {
							'wp-block-latest-posts': true,
							'is-grid': postLayout === 'grid',
							'has-dates': displayPostDate,
							[ `columns-${ columns }` ]: postLayout === 'grid',
						} ) }
					>
						{ displayPosts && displayPosts.map( post => displayListItem( post ) ) }
					</ul>
				) : (
					<p className="happyprime-block-latest-custom-posts_error">{
						( errorMessage )
							? errorMessage
							: ( customPostType )
								? <Spinner />
								: 'Select a post type in this block\'s settings.'
					}</p>
				) }
			</Fragment>
		);
	} ),

	save() {
		return null;
	},
} );
