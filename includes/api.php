<?php
/**
 * Interface with CAB.
 *
 * @package content-aggregator-block
 */

namespace HappyPrime\ContentAggregator\API;

/**
 * Retrieve a list of posts containing a content aggregator block.
 *
 * @return array List of post IDs.
 */
function get_cab_posts() {
	global $wpdb;

	$results = $wpdb->get_results( "SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_cab_has_cab_block'" );

	return $results ? array_map( 'intval', wp_list_pluck( $results, 'post_id' ) ) : [];
}

/**
 * Retrieve a list of post types assumed to support content aggregator blocks.
 *
 * @return array List of post types.
 */
function get_cab_post_types() {
	$types = get_post_types(
		[
			'public' => true,
		],
	);

	/**
	 * Filter the list of post types assumed to support content aggregator blocks.
	 *
	 * @param array $attributes A list of post types. All public post types
	 *                          by default.
	 */
	return apply_filters( 'content_aggregator_block_post_types', $types );
}
