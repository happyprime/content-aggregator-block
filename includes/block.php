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
				'customPostType'  => array(
					'type'    => 'string',
					'default' => 'post,posts',
				),
				'taxRelation'     => array(
					'type'    => 'string',
					'default' => '',
				),
				'itemCount'       => array(
					'type'    => 'integer',
					'default' => 3,
				),
				'order'           => array(
					'type'    => 'string',
					'default' => 'desc',
				),
				'orderBy'         => array(
					'type'    => 'string',
					'default' => 'date',
				),
				'displayPostDate' => array(
					'type'    => 'boolean',
					'default' => false,
				),
				'postLayout'      => array(
					'type'    => 'string',
					'default' => 'list',
				),
				'columns'         => array(
					'type'    => 'integer',
					'default' => 2,
				),
				// Type and default value removed as this attributed is being
				// repurposed from a deprecated version with a different type.
				'customTaxonomy'  => array(),
				// Deprecated.
				'termID'          => array(
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
	if ( $attributes['termID'] ) {
		$attributes['customTaxonomy'] = array(
			array(
				'slug'  => $attributes['customTaxonomy'],
				'terms' => array( $attributes['termID'] ),
			),
		);
	}

	if ( ! empty( $attributes['customTaxonomy'] ) ) {
		$tax_query = array();

		if ( '' !== $attributes['taxRelation'] ) {
			$tax_query['relation'] = $attributes['taxRelation'];
		}

		foreach ( $attributes['customTaxonomy'] as $taxonomy ) {
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
		'customPostType'  => 'post,posts',
		'customTaxonomy'  => array(),
		'taxRelation'     => '',
		'itemCount'       => 3,
		'order'           => 'desc',
		'orderBy'         => 'date',
		'displayPostDate' => false,
		'postLayout'      => 'list',
		'columns'         => 2,
		'className'       => '',
	);
	$attributes = wp_parse_args( $attributes, $defaults );
	$args       = build_query_args( $attributes );
	$posts      = get_posts( $args );

	// Render nothing if no posts are available.
	if ( empty( $posts ) ) {
		return '';
	}

	ob_start();

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
		'customTaxonomy' => $request->get_param( 'taxonomies' ) ? $request->get_param( 'taxonomies' ) : array(),
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

			$post = array(
				'title'    => get_the_title(),
				'date_gmt' => get_the_date( '' ),
				'link'     => get_the_permalink(),
			);

			$posts[] = $post;
		}
		wp_reset_postdata();
	}

	return $posts;
}
