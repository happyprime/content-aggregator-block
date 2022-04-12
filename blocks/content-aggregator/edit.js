/*global cabStickyPostSupport */

// External dependencies.
import classnames from 'classnames';

// WordPress dependencies.
import apiFetch from '@wordpress/api-fetch';

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
	__experimentalGetSettings, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	dateI18n,
	format,
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

import { addQueryArgs } from '@wordpress/url';

// Internal dependencies.
import AuthorControl from './author-control';

import TermSelect from './term-select';

import './editor.scss';

// Module constants.
const COMMON_ARGS = { per_page: -1 };

const MAX_POSTS_COLUMNS = 6;

const TAXONOMY_SETTING = {
	slug: '',
	terms: [],
	operator: 'IN',
};

export default function ContentAggregatorEdit(props) {
	const { attributes, setAttributes } = props;

	const {
		addLinkToFeaturedImage,
		authors,
		columns,
		customPostType,
		displayImage,
		displayPostAuthor,
		displayPostContent,
		displayPostDate,
		excerptLength,
		imageSize,
		itemCount,
		order,
		orderBy,
		postContent,
		postLayout,
		stickyPosts,
		taxRelation,
		taxonomies,
	} = attributes;

	// Get the selected post type slug.
	const postTypeSlug = customPostType.split(',')[0];

	// Set up options.
	const { postTypeOptions, taxonomyOptions, imageSizeOptions } = useSelect(
		(select) => {
			const { getPostTypes, getTaxonomies } = select('core');
			const postTypes = getPostTypes(COMMON_ARGS);
			const allTaxonomies = getTaxonomies(COMMON_ARGS);
			const imageSizes =
				select('core/block-editor').getSettings().imageSizes;

			// Exclude `attachment` from the post type options. Filtered to allow customization.
			const excludeTypes = applyFilters(
				'contentAggregatorBlock.ExcludePostTypes',
				['attachment']
			);

			const postTypeSlugs = [];
			const taxonomySlugs = [];
			const imageSizeSlugs = [];

			// Populate post type and taxonomy options.
			if (postTypes) {
				postTypes.forEach((type) => {
					if (
						type.viewable &&
						type.rest_base &&
						!excludeTypes.includes(type.slug)
					) {
						postTypeSlugs.push({
							label: type.labels.singular_name,
							value: type.slug,
						});

						if (
							postTypeSlug === type.slug &&
							type.taxonomies.length &&
							allTaxonomies
						) {
							taxonomySlugs.push({
								label: __('None'),
								value: '',
							});

							allTaxonomies.forEach((tax) => {
								if (
									tax.visibility.public &&
									type.taxonomies.includes(tax.slug)
								) {
									taxonomySlugs.push({
										label: tax.name,
										value: tax.slug + ',' + tax.rest_base,
									});
								}
							});
						}
					}
				});
			}

			// Populate image size options.
			if (imageSizes) {
				imageSizes.forEach((size) => {
					imageSizeSlugs.push({
						value: size.slug,
						label: size.name,
					});
				});
			}

			return {
				postTypeOptions: postTypeSlugs,
				taxonomyOptions: taxonomySlugs,
				imageSizeOptions: imageSizeSlugs,
			};
		},
		[postTypeSlug]
	);

	// Initialize a state for managing the posts to display.
	// This gets set as an array, but is intentionally initialized with a different type
	// so that the `<Spinner>` displays instead of the `No items` message on mount.
	const [latestPosts, setLatestPosts] = useState('');

	const isStillMounted = useRef();

	useEffect(() => {
		isStillMounted.current = true;

		const postsFetchData = {
			post_type: postTypeSlug,
			per_page: itemCount,
			order,
			orderby: orderBy,
		};

		if (cabStickyPostSupport.includes(postTypeSlug) && stickyPosts) {
			postsFetchData.sticky_posts = true;
		}

		if (authors) {
			postsFetchData.authors = authors;
		}

		if (taxonomies) {
			postsFetchData.taxonomies = taxonomies;

			if (taxRelation) {
				postsFetchData.tax_relation = taxRelation;
			}
		}

		apiFetch({
			path: addQueryArgs(
				'/content-aggregator-block/v1/posts/',
				postsFetchData
			),
		})
			.then((data) => {
				if (isStillMounted.current) {
					setLatestPosts(data);
				}
			})
			.catch(() => {
				if (isStillMounted.current) {
					setLatestPosts([]);
				}
			});

		// Handle deprecated taxonomy attributes if needed.
		if (
			isStillMounted.currrent &&
			(attributes.customTaxonomy || attributes.termID)
		) {
			const taxonomy = [
				{
					slug: attributes.customTaxonomy,
					terms: [`${attributes.termID}`],
				},
			];

			setAttributes({
				taxonomies: taxonomy,
				customTaxonomy: undefined,
				termID: undefined,
			});
		}

		return () => {
			isStillMounted.current = false;
		};
	}, [
		authors,
		itemCount,
		order,
		orderBy,
		postTypeSlug,
		stickyPosts,
		taxonomies,
		taxRelation,
	]);

	const hasPosts = Array.isArray(latestPosts) && latestPosts.length;

	const blockProps = useBlockProps({
		className: classnames({
			'wp-block-latest-posts': true,
			'happyprime-block-cab_error': !hasPosts,
			'cab-has-post-thumbnail': displayImage,
			'cab-has-post-date': displayPostDate,
			'cab-has-post-author': displayPostAuthor,
			'cab-has-post-content':
				displayPostContent && postContent === 'full_post',
			'cab-has-post-excerpt':
				displayPostContent && postContent === 'excerpt',
			'is-grid': postLayout === 'grid',
			[`columns-${columns}`]: postLayout === 'grid',
		}),
	});

	/**
	 * Handle updates to the taxonomy settings.
	 *
	 * @param {number}       index    The setting data index.
	 * @param {string}       property The property to update.
	 * @param {string|Array} value    Updated value to apply to the setting.
	 * @return {Array} The array with which to update the `taxonomies` attribute.
	 */
	const updatedTaxonomies = (index, property, value) => {
		let taxonomiesUpdate;

		if ('undefined' !== typeof taxonomies && taxonomies.length) {
			taxonomiesUpdate = Object.values({
				...taxonomies,
				[index]: {
					...taxonomies[index],
					[property]: value,
				},
			});
		}

		// Initialize a new array for taxonomy settings if none exist,
		// otherwise reset the other properties if the slug of an existing setting is changed.
		if ('slug' === property) {
			if ('undefined' === typeof taxonomies || !taxonomies.length) {
				taxonomiesUpdate = [
					{
						slug: value,
						terms: [],
						operator: 'IN',
					},
				];
			} else if (value !== taxonomies[index].slug) {
				taxonomiesUpdate = Object.values({
					...taxonomiesUpdate,
					[index]: {
						...taxonomiesUpdate[index],
						terms: [],
						operator: undefined,
					},
				});
			}
		}

		// Handles changes to the `operator` property when terms are changed.
		if ('terms' === property) {
			const operatorValue =
				// eslint-disable-next-line no-nested-ternary
				!taxonomies[index].operator && 1 < value.length
					? 'IN'
					: 1 < value.length
					? taxonomies[index].operator
					: undefined;

			taxonomiesUpdate = Object.values({
				...taxonomiesUpdate,
				[index]: {
					...taxonomiesUpdate[index],
					operator: operatorValue,
				},
			});
		}

		return taxonomiesUpdate;
	};

	/**
	 * Display an individual taxonomy setting.
	 *
	 * @param {Object} taxonomy The setting data.
	 * @param {number} index    The setting data index.
	 * @return {WPElement} Element to render.
	 */
	const taxonomySetting = (taxonomy, index) => {
		return (
			<div className="happyprime-block-cab_taxonomy-setting-wrapper">
				{0 < index && (
					<Button
						className="happyprime-block-cab_taxonomy-remove-setting"
						icon={cancelCircleFilled}
						label={__('Remove taxonomy setting')}
						onClick={() => {
							taxonomies.splice(index, 1);

							setAttributes({
								taxonomies: [...taxonomies],
							});

							if (1 === taxonomies.length) {
								setAttributes({ taxRelation: undefined });
							}
						}}
					/>
				)}
				<div className="happyprime-block-cab_taxonomy-setting">
					<SelectControl
						label={__('Taxonomy')}
						value={taxonomy.slug ? taxonomy.slug : ''}
						options={taxonomyOptions}
						onChange={(value) => {
							if ('' === value) {
								if (1 === taxonomies.length) {
									setAttributes({ taxonomies: [] });
								} else {
									taxonomies.splice(index, 1);

									setAttributes({
										taxonomies: [...taxonomies],
									});
								}
							} else {
								setAttributes({
									taxonomies: updatedTaxonomies(
										index,
										'slug',
										value
									),
								});
							}
						}}
					/>
					{taxonomy.slug !== '' && (
						<TermSelect
							onChange={(value) =>
								setAttributes({
									taxonomies: updatedTaxonomies(
										index,
										'terms',
										value
									),
								})
							}
							selectedTerms={taxonomy.terms}
							taxonomy={taxonomy.slug}
						/>
					)}
					{taxonomy.terms && 1 < taxonomy.terms.length && (
						<RadioControl
							label={__('Show posts:')}
							selected={taxonomy.operator}
							options={[
								{
									label: __('With any selected terms'),
									value: 'IN',
								},
								{
									label: __('With all selected terms'),
									value: 'AND',
								},
								{
									label: __('Without the selected terms'),
									value: 'NOT IN',
								},
							]}
							onChange={(value) =>
								setAttributes({
									taxonomies: updatedTaxonomies(
										index,
										'operator',
										value
									),
								})
							}
						/>
					)}
				</div>
			</div>
		);
	};

	// Inspector controls markup.
	const inspectorControls = (
		<InspectorControls>
			<PanelBody title={__('Settings')} className="happyprime-block-cab">
				{postLayout === 'grid' && (
					<RangeControl
						label={__('Columns')}
						value={columns}
						onChange={(value) => setAttributes({ columns: value })}
						min={2}
						max={
							!hasPosts
								? MAX_POSTS_COLUMNS
								: Math.min(
										MAX_POSTS_COLUMNS,
										latestPosts.length
								  )
						}
						required
					/>
				)}
				<SelectControl
					help={__(
						'WordPress contains different types of content which are divided into collections called "Post Types". Default types include blog posts and pages, though plugins may remove these or add others.'
					)}
					label={__('Post Type')}
					value={customPostType}
					options={postTypeOptions}
					onChange={(value) => {
						setAttributes({
							customPostType: value,
							taxonomies: [],
						});
					}}
				/>
				<RangeControl
					label={__('Number of Items')}
					value={itemCount}
					onChange={(value) => {
						setAttributes({ itemCount: Number(value) });
					}}
					min={1}
					max={100}
				/>
				<SelectControl
					key="query-controls-order-select"
					label={__('Order By')}
					value={`${orderBy}/${order}`}
					options={[
						{
							label: __('Newest to Oldest'),
							value: 'date/desc',
						},
						{
							label: __('Oldest to Newest'),
							value: 'date/asc',
						},
						{
							label: __('A → Z'),
							value: 'title/asc',
						},
						{
							label: __('Z → A'),
							value: 'title/desc',
						},
						{
							label: __('Random'),
							value: 'rand/desc',
						},
					]}
					onChange={(value) => {
						const [newOrderBy, newOrder] = value.split('/');
						const atts = {};

						if (newOrder !== order) {
							atts.order = newOrder;
						}

						if (newOrderBy !== orderBy) {
							atts.orderBy = newOrderBy;
						}

						if (atts.order || atts.orderBy) {
							setAttributes(atts);
						}
					}}
				/>
				{cabStickyPostSupport.includes(customPostType.split(',')[0]) &&
					'date' === orderBy && (
						<ToggleControl
							label={__(
								'Show sticky posts at the start of the set'
							)}
							checked={stickyPosts}
							onChange={(value) => {
								setAttributes({ stickyPosts: value });
							}}
						/>
					)}
			</PanelBody>
			<PanelBody title={__('Filters')} className="happyprime-block-cab">
				<div className="happyprime-block-cab_taxonomy-settings">
					<p>{__('Taxonomies')}</p>
					{taxonomies && 0 < taxonomies.length
						? taxonomies.map((taxonomy, index) =>
								taxonomySetting(taxonomy, index)
						  )
						: taxonomySetting(TAXONOMY_SETTING, 0)}
					{taxonomies &&
						0 < taxonomies.length &&
						taxonomies[0].terms &&
						0 < taxonomies[0].terms.length && (
							<Button
								className="happyprime-block-cab_taxonomy-add-setting"
								icon={plusCircle}
								onClick={() => {
									setAttributes({
										taxonomies:
											taxonomies.concat(TAXONOMY_SETTING),
									});

									if (!taxRelation) {
										setAttributes({
											taxRelation: 'AND',
										});
									}
								}}
								text={__('Add more taxonomy settings')}
							/>
						)}
					{taxonomies && 1 < taxonomies.length && (
						<div className="happyprime-block-cab_taxonomy-relation">
							<p>{__('Taxonomy Settings Relationship')}</p>
							<RadioControl
								label={__('Show posts that match:')}
								selected={taxRelation}
								options={[
									{
										label: __('All settings ("AND")'),
										value: 'AND',
									},
									{
										label: __('Any settings ("OR")'),
										value: 'OR',
									},
								]}
								onChange={(option) =>
									setAttributes({
										taxRelation: option,
									})
								}
							/>
						</div>
					)}
				</div>
				<AuthorControl
					onChange={(value) => setAttributes({ authors: value })}
					value={authors}
				/>
			</PanelBody>
			<PanelBody
				title={__('Post Template')}
				className="happyprime-block-cab"
			>
				<ToggleControl
					label={__('Display post date')}
					checked={displayPostDate}
					onChange={(value) =>
						setAttributes({ displayPostDate: value })
					}
				/>
				<ToggleControl
					label={__('Display post author')}
					checked={displayPostAuthor}
					onChange={(value) =>
						setAttributes({ displayPostAuthor: value })
					}
				/>
				<ToggleControl
					label={__('Display post content')}
					checked={displayPostContent}
					onChange={(value) =>
						setAttributes({ displayPostContent: value })
					}
				/>
				{displayPostContent && (
					<RadioControl
						label={__('Show')}
						selected={postContent}
						options={[
							{
								label: __('Excerpt'),
								value: 'excerpt',
							},
							{
								label: __('Full Post'),
								value: 'full_post',
							},
						]}
						onChange={(value) =>
							setAttributes({ postContent: value })
						}
					/>
				)}
				{displayPostContent && postContent === 'excerpt' && (
					<RangeControl
						label={__('Max number of words in excerpt')}
						value={excerptLength}
						onChange={(value) =>
							setAttributes({ excerptLength: value })
						}
						min={10}
						max={100}
					/>
				)}
				<ToggleControl
					label={__('Display featured image')}
					checked={displayImage}
					onChange={(value) => setAttributes({ displayImage: value })}
				/>
				{displayImage && (
					<Fragment>
						<SelectControl
							label={__('Image size')}
							onChange={(value) =>
								setAttributes({ imageSize: value })
							}
							options={imageSizeOptions}
							value={imageSize}
						/>
						<ToggleControl
							label={__('Add link to featured image')}
							checked={addLinkToFeaturedImage}
							onChange={(value) =>
								setAttributes({
									addLinkToFeaturedImage: value,
								})
							}
						/>
					</Fragment>
				)}
			</PanelBody>
		</InspectorControls>
	);

	// Return early if there are no posts to show.
	if (!hasPosts) {
		return (
			<div {...blockProps}>
				{inspectorControls}
				<Placeholder icon={pin} label={__('Content Aggregator')}>
					{!Array.isArray(latestPosts) ? (
						<Spinner />
					) : (
						__('No current items.')
					)}
				</Placeholder>
			</div>
		);
	}

	// Removing posts from display should be instant.
	const displayPosts =
		latestPosts.length > itemCount
			? latestPosts.slice(0, itemCount)
			: latestPosts;

	/**
	 * Display an individual item.
	 *
	 * @param {Object} post Post data to display.
	 * @return {WPElement} Element to render.
	 */
	const displayListItem = (post) => {
		const titleTrimmed = post.title.trim();

		const excerptElement = document.createElement('div');

		excerptElement.innerHTML = post.excerpt;

		const excerpt =
			excerptElement.textContent || excerptElement.innerText || '';

		const item = (
			<li>
				<Disabled>
					<a href={post.link} rel="noreferrer noopener">
						{titleTrimmed ? (
							<RawHTML>{titleTrimmed}</RawHTML>
						) : (
							__('(Untitled)')
						)}
					</a>
				</Disabled>
				{displayPostAuthor && post.author && (
					<div className="wp-block-latest-posts__post-author">
						<span className="byline">
							By <span clasNames="author">{post.author}</span>
						</span>
					</div>
				)}
				{displayPostDate && post.date_gmt && (
					<time
						dateTime={format('c', post.date_gmt)}
						className="wp-block-latest-posts__post-date"
					>
						{dateI18n(
							__experimentalGetSettings().formats.date,
							post.date_gmt
						)}
					</time>
				)}
				{displayImage && post.image[imageSize] && (
					<figure className="wp-block-latest-posts__post-thumbnail">
						{addLinkToFeaturedImage ? (
							<Disabled>
								<a href={post.link} rel="noreferrer noopener">
									<img src={post.image[imageSize]} alt="" />
								</a>
							</Disabled>
						) : (
							<img src={post.image[imageSize]} alt="" />
						)}
					</figure>
				)}
				{displayPostContent && postContent === 'excerpt' && (
					<div className="wp-block-latest-posts__post-excerpt">
						<RawHTML key="html">
							{excerptLength < excerpt.trim().split(' ').length
								? excerpt
										.trim()
										.split(' ', excerptLength)
										.join(' ') + '…'
								: excerpt
										.trim()
										.split(' ', excerptLength)
										.join(' ')}
						</RawHTML>
					</div>
				)}
				{displayPostContent && postContent === 'full_post' && (
					<div className="wp-block-latest-posts__post-full-content">
						<RawHTML key="html">{post.content.trim()}</RawHTML>
					</div>
				)}
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
			{inspectorControls}
			<BlockControls>
				<ToolbarGroup
					controls={[
						{
							icon: list,
							title: __('List View'),
							onClick: () =>
								setAttributes({ postLayout: 'list' }),
							isActive: postLayout === 'list',
						},
						{
							icon: grid,
							title: __('Grid View'),
							onClick: () =>
								setAttributes({ postLayout: 'grid' }),
							isActive: postLayout === 'grid',
						},
					]}
				/>
			</BlockControls>
			<ul {...blockProps}>
				{displayPosts.map((post) => displayListItem(post))}
			</ul>
		</Fragment>
	);
}
