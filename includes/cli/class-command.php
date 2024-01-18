<?php
/**
 * Manage and audit content aggregator blocks from the command line.
 *
 * @package content-aggregator-block
 */

namespace HappyPrime\ContentAggregator\CLI;

use WP_CLI\Utils;
use WP_CLI_Command;

/**
 * Commands used to manage and audit content aggregator blocks from the
 * command line.
 */
class Command extends WP_CLI_Command {

	/**
	 * Reduce a list of blocks and their inner blocks to a flat
	 * list of all blocks.
	 *
	 * @param array $blocks A list of WordPress blocks.
	 * @return array A flattened list of WordPress blocks.
	 */
	private function flatten_blocks( $blocks ): array {
		$flattened_blocks = array();

		foreach ( $blocks as $block ) {
			$flattened_blocks[] = $block;

			if ( 0 < count( $block['innerBlocks'] ) ) {
				$inner_blocks = $this->flatten_blocks( $block['innerBlocks'] );

				$flattened_blocks = array_merge( $flattened_blocks, $inner_blocks );
			}
		}

		return $flattened_blocks;
	}

	/**
	 * Retrieve a list of posts containing content aggregator blocks.
	 *
	 * @return array A list of post IDs.
	 */
	private function get_posts(): array {
		global $wpdb;

		$post_ids = $wpdb->get_results(
			"SELECT ID FROM $wpdb->posts WHERE post_content LIKE '%content-aggregator%' AND post_status IN ( 'publish', 'draft', 'pending', 'future' )"
		);

		return $post_ids ? $post_ids : array();
	}

	/**
	 * Retrieve a list of posts containing content aggregator blocks and the
	 * attributes used for each.
	 *
	 * @subcommand audit-blocks
	 *
	 * @param array $args The command arguments.
	 */
	public function audit_blocks( $args ): void {
		$format   = isset( $args[0] ) ? $args[0] : 'csv';
		$post_ids = $this->get_posts();
		$results  = array();
		$progress = Utils\make_progress_bar( 'Auditing content for content aggregator blocks', count( $post_ids ) );

		foreach ( $post_ids as $post_id ) {
			$post   = get_post( $post_id->ID );
			$blocks = parse_blocks( $post->post_content );
			$blocks = $this->flatten_blocks( $blocks );

			foreach ( $blocks as $block ) {
				if ( 'happyprime/content-aggregator' !== $block['blockName'] ) {
					continue;
				}

				$attributes = $block['attrs'];

				$type = '';
				if ( isset( $attributes['customTaxonomy'] ) ) {
					$type = is_array( $attributes['customTaxonomy'] ) ? 'array' : 'string';
				}

				$results[] = array(
					'post_id'        => $post_id->ID,
					'slug'           => $post->post_name,
					'title'          => $post->post_title,
					'status'         => $post->post_status,
					'block'          => $block['blockName'],
					'customPostType' => isset( $attributes['customPostType'] ) ? $attributes['customPostType'] : '',
					'taxonomies'     => isset( $attributes['taxonomies'] ) ? wp_json_encode( $attributes['taxonomies'] ) : '',
					'customTaxonomy' => isset( $attributes['customTaxonomy'] ) ? wp_json_encode( $attributes['customTaxonomy'] ) : '',
					'customType'     => $type,
					'itemCount'      => $attributes['itemCount'] ?? '',
					'termID'         => isset( $attributes['termID'] ) ? $attributes['termID'] : '',
				);
			}

			$progress->tick();
		}

		$progress->finish();

		$headers = array();
		if ( ! empty( $results ) ) {
			$headers = array_keys( $results[0] );
		}

		Utils\format_items( $format, $results, $headers );
	}

	/**
	 * Fix incorrect and deprecated attributes on old instances of the content
	 * aggregator block.
	 *
	 * @subcommand fix-block-attributes
	 */
	public function fix_block_attributes(): void {
		$posts    = $this->get_posts();
		$progress = Utils\make_progress_bar( 'Fixing content aggregator block attributes', count( $posts ) );

		foreach ( $posts as $post ) {
			$post    = get_post( $post->ID );
			$blocks  = parse_blocks( $post->post_content );
			$blocks  = $this->flatten_blocks( $blocks );
			$content = $post->post_content;

			foreach ( $blocks as $block ) {
				if ( 'happyprime/content-aggregator' !== $block['blockName'] ) {
					continue;
				}

				$original   = serialize_block( $block );
				$attributes = $block['attrs'];

				// If this is a previous iteration of the block in which the `customTaxonomy`
				// attribute was stored as a string, and the taxonomies attribute is not set,
				// create a taxonomies attribute from the data.
				if ( empty( $attributes['taxonomies'] ) && ! empty( $attributes['termID'] ) && ! empty( $attributes['customTaxonomy'] ) && ! is_array( $attributes['customTaxonomy'] ) ) {
					$attributes['taxonomies'] = array(
						array(
							'slug'  => $attributes['customTaxonomy'],
							'terms' => array( $attributes['termID'] ),
						),
					);
					unset( $attributes['termID'] );
					unset( $attributes['customTaxonomy'] );
				} elseif ( empty( $attributes['taxonomies'] ) && ! empty( $attributes['customTaxonomy'] ) && is_array( $attributes['customTaxonomy'] ) ) {
					// If this is a previous iteration of the block in which the `customTaxonomy`
					// attribute was stored as an array, and the taxonomies attribute is not set,
					// create a taxonomies attribute from the data.
					$attributes['taxonomies'] = $attributes['customTaxonomy'];
					unset( $attributes['customTaxonomy'] );
				} elseif ( ! empty( $attributes['taxonomies'] ) && ! empty( $attributes['customTaxonomy'] ) && is_array( $attributes['customTaxonomy'] ) ) {
					unset( $attributes['customTaxonomy'] );
				}

				// If the customPostType attribute is a comma separated string, retrieve the first value.
				if ( ! empty( $attributes['customPostType'] ) && is_string( $attributes['customPostType'] ) ) {
					$attributes['customPostType'] = explode( ',', $attributes['customPostType'] )[0];
				}

				$block['attrs'] = $attributes;
				$fixed          = serialize_block( $block );

				$content = str_replace( $original, $fixed, $content );
			}

			if ( $content !== $post->post_content ) {
				$post->post_content = $content;
				wp_update_post( $post );
			}

			$progress->tick();
		}

		$progress->finish();
	}
}
