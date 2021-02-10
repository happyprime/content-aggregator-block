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
} = ( 'undefined' === typeof wp.blockEditor ) ? wp.editor : wp.blockEditor;

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
registerBlockType( 'happyprime/content-aggregator', {

	title: __( 'Content Aggregator' ),

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
				attributes,
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
				itemCount,
				taxRelation,
				order,
				orderBy,
				stickyPosts,
			} = attributes;

			const taxonomies = ( 0 < attributes.taxonomies.length )
				? attributes.taxonomies
				: ( !attributes.customTaxonomy )
					? []
					: ( 'string' !== typeof attributes.customTaxonomy )
						? attributes.customTaxonomy
						: [ {
							slug: attributes.customTaxonomy,
							terms: [ `${attributes.termID}` ],
						} ];

			let postID = select( 'core/editor' ).getCurrentPostId();

			let doRequest     = false;
			let doTermRequest = false;

			if ( triggerRefresh && false === doingLatestPostsFetch ) {
				doRequest = true;
			}

			if ( triggerTermsRefresh && false === doingTermsFetch ) {
				doTermRequest = true;
			}

			if ( postID && taxonomies && 0 < taxonomies.length && doTermRequest ) {
				setState( {
					doingTermsFetch: true,
					triggerTermsRefresh: false,
				} );

				let terms = [];

				taxonomies.forEach( ( taxonomy, index ) => {

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
				const postType = customPostType.split( ',' )[0];

				setState( {
					doingLatestPostsFetch: true,
					triggerRefresh: false,
				} );

				let fetchData = {
					post_type: postType,
					per_page: itemCount,
					order: order,
					orderby: orderBy,
				};

				if ( cabStickyPostSupport.includes( postType ) && stickyPosts ) {
					fetchData['sticky_posts'] = true;
				}

				if ( taxonomies ) {
					fetchData['taxonomies'] = taxonomies;

					if ( taxRelation ) {
						fetchData['tax_relation'] = taxRelation;
					}
				}

				apiFetch( {
					path: addQueryArgs( '/content-aggregator-block/v1/posts/', fetchData ),
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
			doingLatestPostsFetch,
		} = props;

		const {
			itemCount,
			customPostType,
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

		const taxonomies = ( 0 < attributes.taxonomies.length )
			? attributes.taxonomies
			: ( !attributes.customTaxonomy )
				? []
				: ( 'string' !== typeof attributes.customTaxonomy )
					? attributes.customTaxonomy
					: [ {
						slug: attributes.customTaxonomy,
						terms: [ `${attributes.termID}` ],
					} ];

		let displayPosts;

		// Ensure the number of posts is limited to the expected number of posts.
		if ( posts && posts.length > itemCount ) {
			displayPosts = posts.slice( 0, itemCount );
		} else {
			displayPosts = posts;
		}

		let currentTypes      = select( 'core' ).getPostTypes();
		let currentTaxonomies = select( 'core' ).getTaxonomies();
		let postTypeOptions   = [];
		let taxonomySlugs     = [];
		let taxonomyOptions   = [ { label: __( 'None' ), value: '' } ];

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

			const excerptElement = document.createElement( 'div' );

			excerptElement.innerHTML = post.excerpt;

			const excerpt = excerptElement.textContent || excerptElement.innerText || '';

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
					{ displayImage && post.image[ imageSize ] &&
						<img src={ post.image[ imageSize ] } />
					}
					{ displayPostContent && postContent === 'excerpt' &&
						<div className="wp-block-latest-posts__post-excerpt">
							<RawHTML
								key="html"
							>
								{ excerptLength < excerpt.trim().split( ' ' ).length ?
									excerpt.trim().split( ' ', excerptLength ).join( ' ' ) + '…' :
									excerpt.trim().split( ' ', excerptLength ).join( ' ' ) }
							</RawHTML>
						</div>
					}
					{ displayPostContent && postContent === 'full_post' &&
						<div className="wp-block-latest-posts__post-full-content">
							<RawHTML
								key="html"
							>
								{ post.content.trim() }
							</RawHTML>
						</div>
					}
				</li>
			);
		};

		const updatedTaxonomies = ( index, property, value ) => {
			let taxonomiesUpdate = Object.values( {
				...taxonomies,
				[ index ]: {
					...taxonomies[ index ],
					[ property ]: value,
				}
			} );

			// Resets the `terms` and `operator` properties when the slug is changed.
			if ( 'slug' === property && taxonomies[ index ] && value !== taxonomies[ index ].slug ) {
				taxonomiesUpdate = Object.values( {
					...taxonomiesUpdate,
					[ index ]: {
						...taxonomiesUpdate[ index ],
						terms: [],
						operator: undefined,
					}
				} );
			}

			// Handles changes to the `operator` property when terms are changed.
			if ( 'terms' === property ) {
				const operatorValue = ( !taxonomies[ index ].operator && 1 < value.length )
					? 'IN'
					: ( 1 < value.length )
						? taxonomies[ index ].operator
						: undefined;

				taxonomiesUpdate = Object.values( {
					...taxonomiesUpdate,
					[ index ]: {
						...taxonomiesUpdate[ index ],
						operator: operatorValue,
					}
				} );
			}

			// Remove deprecated taxonomy attributes.
			if ( attributes.customTaxonomy || attributes.termID ) {
				setAttributes( {
					customTaxonomy: undefined,
					termID: undefined,
				} );
			}

			return taxonomiesUpdate;
		}

		const taxonomySetting = ( taxonomy, index ) => {
			return (
				<div className="happyprime-block-content-aggregator-block_taxonomy-setting-wrapper">
					{ 0 < index && (
						<IconButton
							className="happyprime-block-content-aggregator-block_remove-taxonomy-setting"
							icon="dismiss"
							label={ __( 'Remove taxonomy setting' ) }
							onClick={ () => {
								taxonomies.splice( index, 1 );

								setAttributes( { taxonomies: [ ...taxonomies ] } );

								if ( 1 === taxonomies.length ) {
									setAttributes( { taxRelation: undefined } );
								}

								setState( {
									triggerRefresh: true,
									latestPosts: [],
								} );
							} }
						/>
					) }
					<div className="happyprime-block-content-aggregator-block_taxonomy-setting">
						<SelectControl
							label={ __( 'Taxonomy' ) }
							value={ ( taxonomy.slug ) ? taxonomy.slug : '' }
							options={ taxonomyOptions }
							onChange={ ( value ) => {
								if ( '' === value ) {
									if ( 1 === taxonomies.length ) {
										setAttributes( { taxonomies: [] } );
									} else {
										taxonomies.splice( index, 1 );

										setAttributes( { taxonomies: [ ...taxonomies ] } );
									}
								} else {
									setAttributes( { taxonomies: updatedTaxonomies( index, 'slug', value ) } );
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
								label={ __( 'Term(s)' ) }
								help={ __( 'Ctrl/Cmd + click to select multiple terms' ) }
								value={ taxonomy.terms }
								options={ terms[ index ] }
								onChange={ ( value ) => {
									setAttributes( { taxonomies: updatedTaxonomies( index, 'terms', value ) } );
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
								label={ __( 'Show posts with:' ) }
								selected={ taxonomy.operator }
								options={ [
									{ label: __( 'Any selected terms' ), value: 'IN' },
									{ label: __( 'All selected terms' ), value: 'AND' },
								] }
								onChange={ ( value ) => {
									setAttributes( { taxonomies: updatedTaxonomies( index, 'operator', value ) } );
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
									/* translators: label for ordering posts by title in ascending order */
									label: __( 'A → Z' ),
									value: 'title/asc',
								},
								{
									/* translators: label for ordering posts by title in descending order */
									label: __( 'Z → A' ),
									value: 'title/desc',
								},
								{
									/* translators: label for displaying random posts */
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
									setState( {
										triggerRefresh: true,
										latestPosts: []
									} );
								}
							} }
						/>
						<RangeControl
							label={ __( 'Number of items' ) }
							value={ itemCount }
							onChange={ ( value ) => {
								setAttributes( { itemCount: Number( value ) } );
								setState( {
									triggerRefresh: true,
									latestPosts: []
								} );
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
								setState( {
									triggerRefresh: true,
									latestPosts: [],
									taxonomyTerms: [],
								} );
							} }
						/>
						{ cabStickyPostSupport.includes( customPostType.split( ',' )[0] ) && 'date' === orderBy &&
							<ToggleControl
								label={ __( 'Show sticky posts at the start of the set' ) }
								checked={ stickyPosts }
								onChange={ ( value ) => {
									setAttributes( { stickyPosts: value } );
									setState( {
										triggerRefresh: true,
										latestPosts: []
									} );
								} }
							/>
						}
						<div className="happyprime-block-content-aggregator-block_taxonomy">
							{ ( taxonomies && 1 < taxonomies.length ) && (
								<p>{ __( 'Taxonomy Settings' ) }</p>
							) }
							<div className="happyprime-block-content-aggregator-block_taxonomy-settings">
								{ ( taxonomies && 0 < taxonomies.length ) ? (
									taxonomies.map( ( taxonomy, index ) => taxonomySetting( taxonomy, index ) )
								) : (
									taxonomySetting( TAXONOMY_SETTING, 0 )
								) }
							</div>
							{ ( taxonomies && 1 < taxonomies.length ) && (
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
							{ ( taxonomies && 0 < taxonomies.length && taxonomies[0].terms && 0 < taxonomies[0].terms.length ) && (
								<IconButton
									icon="plus-alt"
									label={ __( 'Add more taxonomy settings' ) }
									onClick={ () => {
										setAttributes( { taxonomies: taxonomies.concat( TAXONOMY_SETTING ) } );

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
					<PanelBody
						title={ __( 'Post Content Settings' ) }
						className="panelbody-custom-latest-posts"
					>
						<ToggleControl
							label={ __( 'Display post date' ) }
							checked={ displayPostDate }
							onChange={ ( value ) => setAttributes( { displayPostDate: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display post content' ) }
							checked={ displayPostContent }
							onChange={ ( value ) => setAttributes( { displayPostContent: value } ) }
						/>
						{ displayPostContent &&
							<RadioControl
								label={ __( 'Show' ) }
								selected={ postContent }
								options={ [
									{ label: __( 'Excerpt' ), value: 'excerpt' },
									{ label: __( 'Full Post' ), value: 'full_post' },
								] }
								onChange={ ( value ) => setAttributes( { postContent: value } ) }
							/>
						}
						{ displayPostContent && postContent === 'excerpt' &&
							<RangeControl
								label={ __( 'Max number of words in excerpt' ) }
								value={ excerptLength }
								onChange={ ( value ) => setAttributes( { excerptLength: value } ) }
								min={ 10 }
								max={ 100 }
							/>
						}
						<ToggleControl
							label={ __( 'Display featured image' ) }
							checked={ displayImage }
							onChange={ ( value ) => setAttributes( { displayImage: value } ) }
						/>
						{ displayImage &&
							<SelectControl
								label={ __( 'Image size' ) }
								selected={ imageSize }
								options={ select( 'core/editor' ).getEditorSettings().cabImageSizeOptions }
								onChange={ ( value ) => setAttributes( { imageSize: value } ) }
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
					<p className="happyprime-block-content-aggregator-block_error">{
						( errorMessage )
							? errorMessage
							: ( !customPostType )
								? __( 'Select a post type in this block\'s settings.' )
								: ( doingLatestPostsFetch )
									? <Spinner />
									: __( 'No current items' )
					}</p>
				) }
			</Fragment>
		);
	} ),

	save() {
		return null;
	},
} );
