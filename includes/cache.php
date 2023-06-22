<?php
/**
 * Manage CAB related cache.
 *
 * Obective(s):
 * - Clear page cache for URLs containing CB blocks when content is updated.
 *
 * @package content-aggregator-block
 */

namespace HappyPrime\ContentAggregator\Cache;

use HappyPrime\ContentAggregator\API;

add_action( 'pre_post_update', __NAMESPACE__ . '\maybe_purge_pre_post_update', 5, 2 );
add_action( 'wp_insert_post', __NAMESPACE__ . '\maybe_purge_wp_insert_post', 5, 2 );

/**
 * Purge posts containing content aggregator blocks when content is updated.
 *
 * @param int   $post_id The post ID.
 * @param array $post    The post object.
 */
function maybe_purge_pre_post_update( int $post_id, array $post ) {
	if ( in_array( $post['post_type'], API\get_cab_post_types(), true ) ) {
		add_filter( 'KinstaCache/purgeImmediate', __NAMESPACE__ . '\filter_kinsta_purge_immediate' );

		// Avoid duplicating efforts.
		remove_action( 'wp_insert_post', __NAMESPACE__ . '\maybe_purge_wp_insert_post', 5 );
	}
}

/**
 * Purge posts containing content aggregator blocks when content is updated.
 *
 * @param int      $post_id The post ID.
 * @param \WP_Post $post    The post object.
 */
function maybe_purge_wp_insert_post( int $post_id, \WP_Post $post ) {
	if ( in_array( $post->post_type, API\get_cab_post_types(), true ) ) {
		add_filter( 'KinstaCache/purgeImmediate', __NAMESPACE__ . '\filter_kinsta_purge_immediate' );
	}
}

/**
 * Filter Kinsta's list of URLs to purge immediately to include posts
 * containing content aggregator blocks.
 *
 * @param array $immediate List of URLs to purge immediately.
 * @return array Modified list of URLs to purge immediately.
 */
function filter_kinsta_purge_immediate( array $immediate ): array {
	$cab_posts = API\get_cab_posts();

	foreach ( $cab_posts as $cab_post ) {
		$immediate[ 'single|custom|' . $cab_post ] = str_replace( [ 'https://', 'http://' ], '', get_permalink( $cab_post ) );
	}

	return $immediate;
}
