// WordPress dependencies.
import { createBlock } from '@wordpress/blocks';

const transforms = {
	from: [
		{
			type: 'block',
			blocks: ['core/latest-posts'],
			transform: (attributes) => {
				return createBlock('happyprime/content-aggregator', {
					itemCount: attributes.postsToShow,
					order: attributes.order,
					orderBy: attributes.orderBy,
					displayPostDate: attributes.displayPostDate,
					postLayout: attributes.postLayout,
					columns: attributes.columns,
					displayPostContent: attributes.displayPostContent,
					postContent: attributes.displayPostContentRadio,
					excerptLength: attributes.excerptLength,
					displayImage: attributes.displayFeaturedImage,
					imageSize: attributes.featuredImageSizeSlug,
					stickyPosts: false,
					addLinkToFeaturedImage: attributes.addLinkToFeaturedImage,
				});
			},
		},
		{
			type: 'block',
			blocks: ['happyprime/latest-custom-posts'],
			transform: (attributes) => {
				/* eslint-disable no-nested-ternary */
				const taxonomies =
					attributes.taxonomies && 0 < attributes.taxonomies.length
						? attributes.taxonomies
						: !attributes.customTaxonomy
						? []
						: 'string' !== typeof attributes.customTaxonomy
						? attributes.customTaxonomy
						: [
								{
									slug: attributes.customTaxonomy,
									terms: [`${attributes.termID}`],
								},
						  ];
				/* eslint-enable no-nested-ternary */

				return createBlock('happyprime/content-aggregator', {
					customPostType: attributes.customPostType,
					taxonomies,
					taxRelation: attributes.taxRelation,
					itemCount: attributes.itemCount,
					order: attributes.order,
					orderBy: attributes.orderBy,
					displayPostDate: attributes.displayPostDate,
					postLayout: attributes.postLayout,
					columns: attributes.columns,
					displayPostContent: attributes.displayPostContent,
					postContent: attributes.postContent,
					excerptLength: attributes.excerptLength,
					displayImage: attributes.displayImage,
					imageSize: attributes.imageSize,
					stickyPosts: attributes.stickyPosts,
				});
			},
		},
	],
};

export default transforms;
