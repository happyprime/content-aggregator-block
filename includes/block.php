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

/**
 * Provide a block version number for scripts.
 *
 * @return string The version number.
 */
function block_version() {
	return '0.0.1';
}

/**
 * Registers the `core/latest-posts` block on server.
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
				'customTaxonomy'  => array(
					'type'    => 'string',
					'default' => '',
				),
				'termID'          => array(
					'type'    => 'integer',
					'default' => 0,
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
			),
			'render_callback' => __NAMESPACE__ . '\\render_block',
		)
	);
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
		'customTaxonomy'  => '',
		'termID'          => 0,
		'itemCount'       => 3,
		'order'           => 'desc',
		'orderBy'         => 'date',
		'displayPostDate' => false,
		'postLayout'      => 'list',
		'columns'         => 2,
		'className'       => '',
	);
	$attributes = wp_parse_args( $attributes, $defaults );

	$post_type = explode( ',', $attributes['customPostType'] );

	$args = array(
		'post_type'      => $post_type[0],
		'posts_per_page' => absint( $attributes['itemCount'] ),
		'order'          => $attributes['order'],
		'orderby'        => $attributes['orderBy'],
	);

	if ( '' !== $attributes['customTaxonomy'] && 0 < $attributes['termID'] ) {
		$taxonomy = explode( ',', $attributes['customTaxonomy'] );

		$args['tax_query'] = array( // phpcs:ignore
			array(
				'taxonomy' => $taxonomy[0],
				'field'    => 'id',
				'terms'    => $attributes['termID'],
			),
		);
	}

	$posts = get_posts( $args );

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
}
