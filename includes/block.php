<?php
/**
 * Handle the server side registration and rendering of the
 * Content Aggregator block.
 *
 * @package content-aggregator-block
 */

namespace HappyPrime\ContentAggregator\Block;

add_action( 'init', __NAMESPACE__ . '\register_block' );
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_editor_assets' );
add_action( 'rest_api_init', __NAMESPACE__ . '\register_posts_endpoint' );
add_action( 'rest_api_init', __NAMESPACE__ . '\register_meta_endpoint' );
add_filter( 'post_class', __NAMESPACE__ . '\filter_post_classes', 10, 3 );
add_filter( 'wp_kses_allowed_html', __NAMESPACE__ . '\allow_additional_html', 10, 2 );

/**
 * Registers the `happyprime/content-aggregator` block on server.
 */
function register_block() {
	register_block_type_from_metadata(
		dirname( __DIR__ ) . '/blocks/content-aggregator/',
		array(
			'render_callback' => __NAMESPACE__ . '\render',
		)
	);
}

/**
 * Builds out query arguments for the given attributes.
 *
 * @param array $attributes The block attributes.
 *
 * @return array The built query arguments.
 */
function build_query_args( $attributes ) {
	$post_type      = explode( ',', $attributes['customPostType'] )[0];
	$posts_per_page = absint( $attributes['itemCount'] );
	$sticky_posts   = get_option( 'sticky_posts' );

	$args = array(
		'post_type'      => $post_type,
		'posts_per_page' => $posts_per_page,
		'order'          => $attributes['order'],
		'orderby'        => $attributes['orderBy'],
		'post_status'    => 'publish',
	);

	if ( 'meta_value' === $attributes['orderBy'] && $attributes['orderByMetaKey'] ) {
		$args['meta_key'] = $attributes['orderByMetaKey']; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key

		if ( $attributes['orderByMetaOrder'] ) {
			$args['order'] = $attributes['orderByMetaOrder'];
		}
	}

	// If this is a previous version of the block, overwrite
	// the `customTaxonomy` attribute using the new format.
	if ( ! empty( $attributes['termID'] ) && ! empty( $attributes['customTaxonomy'] ) && ! is_array( $attributes['customTaxonomy'] ) ) {
		$attributes['customTaxonomy'] = array(
			array(
				'slug'  => $attributes['customTaxonomy'],
				'terms' => array( $attributes['termID'] ),
			),
		);
	}

	// Use the new `taxonomies` attribute if available.
	$taxonomies = ( ! empty( $attributes['taxonomies'] ) )
		? $attributes['taxonomies']
		: $attributes['customTaxonomy'] ?? array();

	if ( ! empty( $taxonomies ) ) {
		$tax_query = array();

		if ( '' !== $attributes['taxRelation'] ) {
			$tax_query['relation'] = $attributes['taxRelation'];
		}

		foreach ( $taxonomies as $taxonomy ) {

			// Skip this taxonomy if it has no term options.
			if ( empty( $taxonomy['terms'] ) ) {
				continue;
			}

			$slug = explode( ',', $taxonomy['slug'] );

			$settings = array(
				'taxonomy' => $slug[0],
				'field'    => 'id',
				'terms'    => $taxonomy['terms'],
			);

			if ( isset( $taxonomy['operator'] ) ) {
				$settings['operator'] = $taxonomy['operator'];
			}

			$tax_query[] = $settings;
		}

		$args['tax_query'] = $tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
	}

	if ( $attributes['authors'] ) {
		$args['author'] = $attributes['authors'];
	}

	// Add arguments to account for sticky posts if appropriate.
	if ( $attributes['stickyPosts'] && is_array( $sticky_posts ) && ! empty( $sticky_posts ) && 'date' === $attributes['orderBy'] ) {
		// Copy the arguments that have been built out so far.
		$stick_posts_query_args = $args;

		// Add arguments to query for sticky posts which match
		// all other criteria.
		$stick_posts_query_args['ignore_sticky_posts'] = true;
		$stick_posts_query_args['post__in']            = $sticky_posts;

		$sticky_posts_query = new \WP_Query( $stick_posts_query_args );

		$sticky_posts_in_params_count = $sticky_posts_query->found_posts;

		// If posts were found, update query arguments accordingly.
		// Otherwise, ignore sticky posts so they show in their natural order.
		if ( $sticky_posts_in_params_count ) {
			// Initialize an empty array for capturing post IDs.
			$sticky_post_ids = array();

			// Add IDs of sticky posts to the `$sticky_post_ids` array.
			while ( $sticky_posts_query->have_posts() ) {
				$sticky_posts_query->the_post();
				$sticky_post_ids[] = get_the_ID();
			}

			wp_reset_postdata();

			if ( $sticky_posts_in_params_count < $posts_per_page ) {
				// If the item count is greater than the sticky posts count,
				// add arguments to query for non sticky posts which meet the criteria.
				$args['posts_per_page']      = $posts_per_page - $sticky_posts_in_params_count;
				$args['ignore_sticky_posts'] = true;
				$args['post__not_in']        = $sticky_post_ids;

				// Run the query and add the found post IDs to the array.
				$posts_query = get_posts( $args );
				$post_ids    = array_merge( $sticky_post_ids, $posts_query );
			} else {
				// If the item count is less than the sticky post count,
				// reduce the number of IDs in the array accordingly.
				$post_ids = array_slice( $sticky_post_ids, 0, $posts_per_page );
			}

			// Completely overwrite arguments.
			$args = array(
				'ignore_sticky_posts' => true,
				'post_type'           => $post_type,
				'post__in'            => $post_ids,
				'orderby'             => 'post__in',
				'no_found_rows'       => true,
			);
		} else {
			$args['ignore_sticky_posts'] = true;
		}
	}

	return $args;
}

/**
 * Renders block in PHP.
 *
 * @param array $attributes The block attributes.
 *
 * @return string HTML
 */
function render( $attributes ) {
	$defaults   = array(
		'customPostType'     => 'post,posts',
		'taxonomies'         => array(),
		'taxRelation'        => '',
		'itemCount'          => 3,
		'order'              => 'desc',
		'orderBy'            => 'date',
		'orderByMetaKey'     => '',
		'orderByMetaOrder'   => '',
		'displayPostDate'    => false,
		'postLayout'         => 'list',
		'columns'            => 2,
		'className'          => '',
		'customTaxonomy'     => array(),
		'displayPostContent' => false,
		'postContent'        => 'excerpt',
		'excerptLength'      => 55,
		'displayImage'       => false,
		'imageSize'          => 'thumbnail',
		'stickyPosts'        => true,
		'authors'            => '',
		'displayPostAuthor'  => false,
	);
	$attributes = wp_parse_args( $attributes, $defaults );
	$args       = build_query_args( $attributes );
	$query      = new \WP_Query( $args );

	$container_class = 'wp-block-latest-posts wp-block-latest-posts__list happyprime-content-aggregator-block';

	if ( isset( $attributes['align'] ) ) {
		$container_class .= ' align' . $attributes['align'];
	}

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$container_class .= ' is-grid';
	}

	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$container_class .= ' columns-' . $attributes['columns'];
	}

	if ( isset( $attributes['displayImage'] ) && $attributes['displayImage'] ) {
		$container_class .= ' cab-has-post-thumbnail';
	}

	if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
		$container_class .= ' cab-has-post-date';
	}

	if ( ! empty( $attributes['displayPostAuthor'] ) ) {
		$container_class .= ' cab-has-post-author';
	}

	if ( isset( $attributes['displayPostContent'] ) && $attributes['displayPostContent'] && isset( $attributes['postContent'] ) ) {
		$container_class .= ( 'full_post' === $attributes['postContent'] )
			? ' cab-has-post-content'
			: ' cab-has-post-excerpt';
	}

	if ( isset( $attributes['className'] ) ) {
		$container_class .= $attributes['className'];
	}

	if ( ! $query->have_posts() ) {
		$container_class .= ' happyprime-content-aggregator-block_no-posts';
	}

	$wrapper_attributes = get_block_wrapper_attributes( array( 'class' => $container_class ) );

	/**
	 * Filter the wrapping element for the block.
	 *
	 * @param string $wrapper    The HTML element name with which to wrap the block. Default ul.
	 * @param array  $attributes A list of block attributes.
	 */
	$wrapper = apply_filters( 'content_aggregator_block_wrapper', 'ul', $attributes );

	ob_start();

	if ( '' !== $wrapper ) {
		echo '<' . $wrapper . ' ' . $wrapper_attributes . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	if ( $query->have_posts() ) {
		while ( $query->have_posts() ) {
			$query->the_post();
			$post = get_post( get_the_ID() );
			render_item( $post, $attributes );
		}
	} else {
		?>
		<li><?php esc_html_e( 'No current items' ); ?></li>
		<?php
	}
	wp_reset_postdata();

	if ( '' !== $wrapper ) {
		echo '</' . $wrapper . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	$html = ob_get_clean();

	return $html;
}

/**
 * Render the markup for an individual post item.
 *
 * @param WP_Post $post       The post.
 * @param array   $attributes The block attributes.
 */
function render_item( $post, $attributes ) {
	ob_start();
	?>
	<li <?php post_class( 'cab-item' ); ?>>
		<a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
		<?php
		if ( ! empty( $attributes['displayPostAuthor'] ) ) {
			?>
			<div class="wp-block-latest-posts__post-author">
				<span class="byline">By <span class="author"><?php echo esc_html( get_the_author() ); ?></span></span>
			</div>
			<?php
		}
		if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
			?>
			<time
				class="wp-block-latest-posts__post-date"
				datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"
			><?php echo esc_html( get_the_date() ); ?></time>
			<?php
		}
		if ( isset( $attributes['displayImage'] ) && $attributes['displayImage'] && has_post_thumbnail() ) {
			$featured_image = get_the_post_thumbnail( get_the_ID(), $attributes['imageSize'] );

			if ( $attributes['addLinkToFeaturedImage'] ) {
				$featured_image = sprintf( '<a href="%1$s">%2$s</a>', get_permalink(), $featured_image );
			}
			?>
			<figure class="wp-block-latest-posts__post-thumbnail">
				<?php echo $featured_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</figure>
			<?php
		}
		if ( isset( $attributes['displayPostContent'] ) && $attributes['displayPostContent'] && isset( $attributes['postContent'] ) ) {
			if ( 'excerpt' === $attributes['postContent'] ) {
				$post_excerpt    = ( $post->post_excerpt ) ? $post->post_excerpt : $post->post_content;
				$trimmed_excerpt = esc_html( wp_trim_words( $post_excerpt, $attributes['excerptLength'], '&hellip;' ) );
				?>
				<div class="wp-block-latest-posts__post-excerpt">
					<?php echo wp_kses_post( $trimmed_excerpt ); ?>
				</div>
				<?php
			}
			if ( 'full_post' === $attributes['postContent'] ) {
				?>
				<div class="wp-block-latest-posts__post-full-content">
					<?php echo wp_kses_post( html_entity_decode( $post->post_content, ENT_QUOTES, get_option( 'blog_charset' ) ) ); ?>
				</div>
				<?php
			}
		}
		?>
	</li>
	<?php
	$html      = ob_get_clean();
	$item_html = apply_filters( 'content_aggregator_block_item', $html, $post, $attributes );

	echo wp_kses( $item_html, 'hp-cab' );
}

/**
 * Enqueue the script used in the editor for this block.
 */
function enqueue_block_editor_assets() {
	$post_types_w_sticky_support = array( 'post' );

	foreach ( get_post_types() as $post_type ) {
		if ( post_type_supports( $post_type, 'sticky' ) ) {
			$post_types_w_sticky_support[] = $post_type;
		}
	}

	$post_types = wp_json_encode( $post_types_w_sticky_support );

	wp_add_inline_script(
		'happyprime-content-aggregator-editor-script',
		"const cabStickyPostSupport = $post_types;",
		'before'
	);
}

/**
 * Register a REST API route for this block.
 */
function register_posts_endpoint() {
	register_rest_route(
		'content-aggregator-block/v1',
		'posts',
		array(
			'methods'             => 'GET',
			'callback'            => __NAMESPACE__ . '\posts_rest_response',
			'permission_callback' => '__return_true',
		)
	);
}

/**
 * Return posts based on the provided parameters.
 *
 * @param \WP_Request $request The incoming REST API request object.
 *
 * @return array Posts found using the provided parameters.
 */
function posts_rest_response( $request ) {
	$attributes = array(
		'authors'        => $request->get_param( 'authors' ) ?? '',
		'customPostType' => $request->get_param( 'post_type' ) ?? 'post,posts',
		'taxonomies'     => $request->get_param( 'taxonomies' ) ?? array(),
		'taxRelation'    => $request->get_param( 'tax_relation' ) ?? '',
		'itemCount'      => $request->get_param( 'per_page' ) ?? 3,
		'order'          => $request->get_param( 'order' ) ?? 'desc',
		'orderBy'        => $request->get_param( 'orderby' ) ?? 'date',
		'orderByMetaKey' => $request->get_param( 'meta_key' ) ?? '',
		'stickyPosts'    => $request->get_param( 'sticky_posts' ) ? true : false,
	);
	$args       = build_query_args( $attributes );
	$query      = new \WP_Query( $args );

	// Assume no posts match the criteria by default.
	$posts = array();

	if ( $query->have_posts() ) {
		while ( $query->have_posts() ) {
			$query->the_post();

			$image_sizes = array();

			if ( has_post_thumbnail( get_the_ID() ) ) {
				$image_id = get_post_thumbnail_id( get_the_ID() );

				foreach ( get_intermediate_image_sizes() as $size ) {
					$image = wp_get_attachment_image_src( $image_id, $size );

					$image_sizes[ $size ] = ( ! $image ) ? false : $image[0];
				}

				$image_sizes['full'] = wp_get_attachment_image_src( $image_id, 'full' )[0];
			}

			$post = array(
				'title'    => get_the_title(),
				'date_gmt' => get_the_date( 'c' ),
				'link'     => get_the_permalink(),
				'content'  => get_the_content(),
				'excerpt'  => wp_strip_all_tags( get_the_excerpt(), true ),
				'image'    => $image_sizes,
				'author'   => get_the_author(),
			);

			$post = apply_filters( 'content_aggregator_block_endpoint_post_data', $post, get_the_ID() );

			$posts[] = $post;
		}
		wp_reset_postdata();
	}

	return $posts;
}

/**
 * Register `meta` endpoint for fetching keys registered for a given post type.
 */
function register_meta_endpoint() {
	register_rest_route(
		'content-aggregator-block/v1',
		'meta',
		array(
			'methods'             => 'GET',
			'callback'            => __NAMESPACE__ . '\meta_rest_response',
			'permission_callback' => '__return_true',
		)
	);
}

/**
 * Return the meta keys registered for the provided post type.
 *
 * @param \WP_Request $request The incoming REST API request object.
 *
 * @return array Posts found using the provided parameters.
 */
function meta_rest_response( $request ) {
	global $wp_meta_keys;

	$subtype = $request->get_param( 'post_type' ) ?? 'post';

	return array_keys( $wp_meta_keys['post'][ $subtype ] );
}

/**
 * Filters classes for posts that have the added `cab-item` class.
 *
 * @param array $classes An array of post class names.
 * @param array $class   An array of additional class names added to the post.
 * @param int   $post_id The post ID.
 */
function filter_post_classes( $classes, $class, $post_id ) {
	if ( in_array( 'cab-item', $class, true ) ) {
		$format = ( has_post_format( $post_id ) ) ? get_post_format( $post_id ) : 'standard';

		// Filter out the `cab-item` flag and a handful of default classes.
		$classes = array_diff(
			$classes,
			array(
				'cab-item',
				'hentry',
				'post-' . $post_id,
				get_post_type( $post_id ),
				'status-' . get_post_status( $post_id ),
				'format-' . $format,
			)
		);

		// Prefix the remaining classes with `cab-`.
		$classes = substr_replace( $classes, 'cab-', 0, 0 );
	}

	return $classes;
}

/**
 * Allow additional HTML elements and attributes that wp_kses_post() normally strips.
 *
 * @param array  $allowed The array of allowed HTML tags.
 * @param string $context The context, such as "post", for the filter.
 */
function allow_additional_html( $allowed, $context ) {
	if ( 'hp-cab' === $context ) {
		$allowed = wp_kses_allowed_html( 'post' );

		// Enable additional tags.
		$allowed['meta'] = array( 'content' => true );
		$allowed['time'] = array(
			'class'    => true,
			'datetime' => true,
		);

		// Enable itemprop, itemscope, and itemtype attributes on common tags.
		$tags_for_atts = array( 'div', 'span', 'p', 'img', 'ul', 'ol', 'li', 'a', 'meta' );

		foreach ( $tags_for_atts as $tag ) {
			$allowed[ $tag ]['itemprop']  = true;
			$allowed[ $tag ]['itemscope'] = true;
			$allowed[ $tag ]['itemtype']  = true;
		}
	}

	return $allowed;
}
