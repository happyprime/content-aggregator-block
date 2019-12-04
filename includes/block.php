<?php
/**
 * Handle the server side registration and rendering of the
 * Latest Custom Posts block.
 *
 * @package latest-custom-posts
 */

namespace HappyPrime\LatestCustomPosts\Block;

add_action( 'init', __NAMESPACE__ . '\\register_block' );
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_editor_assets' );
add_action( 'rest_api_init', __NAMESPACE__ . '\\register_route' );
add_filter( 'block_editor_settings', __NAMESPACE__ . '\\image_size_options', 10, 1 );

/**
 * Provide a block version number for scripts.
 *
 * @return string The version number.
 */
function block_version() {
	return '0.0.1';
}

/**
 * Registers the `happyprime/latest-custom-posts` block on server.
 */
function register_block() {
	register_block_type(
		'happyprime/latest-custom-posts',
		array(
			'attributes'      => array(
				'customPostType'     => array(
					'type'    => 'string',
					'default' => 'post,posts',
				),
				'taxonomies'         => array(
					'type'    => 'array',
					'default' => array(),
				),
				'taxRelation'        => array(
					'type'    => 'string',
					'default' => '',
				),
				'itemCount'          => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'order'              => array(
					'type'    => 'string',
					'default' => 'desc',
				),
				'orderBy'            => array(
					'type'    => 'string',
					'default' => 'date',
				),
				'displayPostDate'    => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'postLayout'         => array(
					'type'    => 'string',
					'default' => 'list',
				),
				'columns'            => array(
					'type'    => 'integer',
					'default' => 2,
				),
				'displayPostContent' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'postContent'        => array(
					'type'    => 'string',
					'default' => 'excerpt',
				),
				'excerptLength'      => array(
					'type'    => 'number',
					'default' => 55,
				),
				'displayImage'       => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'imageSize'          => array(
					'type'    => 'string',
					'default' => 'thumbnail',
				),
				// Deprecated.
				'customTaxonomy'     => array(),
				'termID'             => array(
					'type'    => 'integer',
					'default' => 0,
				),
			),
			'render_callback' => __NAMESPACE__ . '\\render_block',
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
	$post_type = explode( ',', $attributes['customPostType'] );

	$args = array(
		'post_type'      => $post_type[0],
		'posts_per_page' => absint( $attributes['itemCount'] ),
		'order'          => $attributes['order'],
		'orderby'        => $attributes['orderBy'],
	);

	// If this is a previous version of the block, overwrite
	// the `customTaxonomy` attribute using the new format.
	if ( $attributes['termID'] && ! is_array( $attributes['customTaxonomy'] ) ) {
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
		: $attributes['customTaxonomy'];

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

			if ( $taxonomy['operator'] ) {
				$settings['operator'] = $taxonomy['operator'];
			}

			$tax_query[] = $settings;
		}

		$args['tax_query'] = $tax_query; // phpcs:ignore
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
function render_block( $attributes ) {
	$defaults   = array(
		'customPostType'     => 'post,posts',
		'taxonomies'         => array(),
		'taxRelation'        => '',
		'itemCount'          => 3,
		'order'              => 'desc',
		'orderBy'            => 'date',
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
	);
	$attributes = wp_parse_args( $attributes, $defaults );
	$args       = build_query_args( $attributes );
	$posts      = get_posts( $args );

	$container_class = 'wp-block-latest-posts wp-block-latest-posts__list happyprime-latest-custom-posts';

	if ( isset( $attributes['align'] ) ) {
		$container_class .= ' align' . $attributes['align'];
	}

	if ( isset( $attributes['postLayout'] ) && 'grid' === $attributes['postLayout'] ) {
		$container_class .= ' is-grid';
	}

	if ( isset( $attributes['columns'] ) && 'grid' === $attributes['postLayout'] ) {
		$container_class .= ' columns-' . $attributes['columns'];
	}

	if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
		$container_class .= ' has-dates';
	}

	if ( isset( $attributes['className'] ) ) {
		$container_class .= ' ' . $attributes['className'];
	}

	// Render "No current items" message if no posts are available.
	if ( empty( $posts ) ) {
		$container_class .= ' happyprime-latest-custom-posts_no-posts';

		ob_start();
		?>
		<ul class="<?php echo esc_attr( $container_class ); ?>">
			<li>No current items</li>
		</ul>
		<?php
		$html = ob_get_clean();

		return $html;
	}

	ob_start();

	?>
	<ul class="<?php echo esc_attr( $container_class ); ?>">
		<?php

		foreach ( $posts as $post ) {
			?>
			<li>
				<a href="<?php echo esc_url( get_permalink( $post ) ); ?>"><?php echo get_the_title( $post ); // phpcs:ignore ?></a>
				<?php
				if ( isset( $attributes['displayPostDate'] ) && $attributes['displayPostDate'] ) {
					?>
					<time datetime="<?php echo esc_attr( get_the_date( 'c', $post ) ); ?>" class="wp-block-latest-posts__post-date"><?php echo esc_html( get_the_date( '', $post ) ); ?></time>
					<?php
				}
				if ( isset( $attributes['displayImage'] ) && $attributes['displayImage'] && has_post_thumbnail( $post ) ) {
					$image_id = get_post_thumbnail_id( $post );
					echo wp_get_attachment_image( $image_id, $attributes['imageSize'], false );
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
		}

		?>
	</ul>
	<?php
	$html = ob_get_clean();

	return $html;
}

/**
 * Enqueue the script used in the editor for this block.
 */
function enqueue_block_editor_assets() {
	wp_enqueue_script(
		'hp-latest-custom-post',
		plugins_url( 'build/index.js', __DIR__ ),
		array(
			'wp-blocks',
			'wp-i18n',
			'wp-element',
		),
		block_version(),
		true
	);

	wp_enqueue_style(
		'hp-latest-custom-posts',
		plugins_url( 'css/editor.css', __DIR__ ),
		array(
			'wp-edit-blocks',
		),
		block_version()
	);
}

/**
 * Register a REST API route for this block.
 */
function register_route() {
	register_rest_route(
		'lcp/v1',
		'posts',
		array(
			'methods'  => 'GET',
			'callback' => __NAMESPACE__ . '\rest_response',
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
function rest_response( $request ) {
	$attributes = array(
		'customPostType' => $request->get_param( 'post_type' ) ? $request->get_param( 'post_type' ) : 'post,posts',
		'taxonomies'     => $request->get_param( 'taxonomies' ) ? $request->get_param( 'taxonomies' ) : array(),
		'taxRelation'    => $request->get_param( 'tax_relation' ) ? $request->get_param( 'tax_relation' ) : '',
		'itemCount'      => $request->get_param( 'per_page' ) ? $request->get_param( 'per_page' ) : 3,
		'order'          => $request->get_param( 'order' ) ? $request->get_param( 'order' ) : 'desc',
		'orderBy'        => $request->get_param( 'order_by' ) ? $request->get_param( 'order_by' ) : 'date',
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
			}

			$post = array(
				'title'    => get_the_title(),
				'date_gmt' => get_the_date( '' ),
				'link'     => get_the_permalink(),
				'content'  => get_the_content(),
				'excerpt'  => wp_strip_all_tags( get_the_excerpt(), true ),
				'image'    => $image_sizes,
			);

			$posts[] = $post;
		}
		wp_reset_postdata();
	}

	return $posts;
}

/**
 * .
 *
 * @param array $editor_settings Editor settings.
 *
 * @return array
 */
function image_size_options( $editor_settings ) {
	$image_options = array();

	foreach ( get_intermediate_image_sizes() as $size ) {
		$image_options[] = array(
			'label' => ucwords( str_replace( array( '-', '_' ), ' ', $size ) ),
			'value' => $size,
		);
	}

	$editor_settings['lcpImageSizeOptions'] = $image_options;

	return $editor_settings;
}
