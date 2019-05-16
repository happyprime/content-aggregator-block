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
			type: 'string',
			default: '',
		},
		termID: {
			type: 'integer',
			default: 0,
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
				termID,
				itemCount,
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

			if ( postID && '' !== customTaxonomy && doTermRequest ) {
				setState( {
					doingTermsFetch: true,
					triggerTermsRefresh: false,
				} );

				let restSlug = customTaxonomy.split( ',' )[1];

				if ( undefined === typeof restSlug ) {
					setState( {
						doingTermsFetch: false,
					} );
				}

				apiFetch( {
					path: addQueryArgs( '/wp/v2/' + restSlug, { per_page: 100 } ),
				} ).then( data => {
					setState( {
						taxonomyTerms: data,
						doingTermsFetch: false,
					} );
				} ).catch( error => {
					setState( {
						errorMessage: error.message,
						taxonomyTerms: [],
						doingTermsFetch: false,
					} );
				} );
			}

			if ( postID && '' !== customPostType && doRequest ) {
				setState( {
					doingLatestPostsFetch: true,
					triggerRefresh: false,
				} );

				let restSlug = customPostType.split( ',' )[1];
				let termSlug = customTaxonomy.split( ',' )[1];

				let data = {
					per_page: itemCount,
					order: order,
					orderby: orderBy,
				};

				if ( 0 < termID ) {
					data[ termSlug ] = termID;
				}

				apiFetch( {
					path: addQueryArgs( '/wp/v2/' + restSlug, data ),
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
			termID,
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
		let termOptions       = [ { label: 'None', value: 0 } ];

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

		terms.forEach( function ( term ) {
			termOptions.push( { label: term.name, value: term.id } );
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
			const titleTrimmed = post.title.rendered.trim();

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

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody
						title={ __( 'Settings' ) }
						className="panelbody-related-stories"
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
									setState( { triggerRefresh: true, latestPosts: [] } );
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
							onChange={ ( itemCount ) => {
								setAttributes( { itemCount } );
								setState( { triggerRefresh: true, latestPosts: [] } );
							} }
						/>
						<SelectControl
							label="Post Type"
							value={ customPostType }
							options={ postTypeOptions }
							onChange={ ( customPostType ) => {
								setAttributes( { customPostType, customTaxonomy: '', termID: 0 } );
								setState( {
									triggerRefresh: true,
									latestPosts: [],
									taxonomyTerms: [],
								} );
							} }
						/>
						{ customPostType !== '' && (
							<SelectControl
								label="Taxonomy"
								value={ customTaxonomy }
								options={ taxonomyOptions }
								onChange={ ( customTaxonomy ) => {
									setAttributes( { customTaxonomy } );
									setState( {
										triggerTermsRefresh: true,
										taxonomyTerms: []
									} );
								} }
							/>
						) }
						{ customTaxonomy !== '' && 0 < termOptions.length && (
							<SelectControl
								label="Term"
								value={ termID }
								options={ termOptions }
								onChange={ ( value ) => {
									setAttributes( { termID: Number( value ) } );
									setState( {
										triggerRefresh: true,
										latestPosts: [],
									} );
								} }
							/>
						) }
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
					<p className="happyprime-block-latest-custom-posts_error">{ errorMessage ? errorMessage : 'Select a post type in this block\'s settings.' }</p>
				) }
			</Fragment>
		);
	} ),

	save() {
		return null;
	},
} );
