<?php
/**
 * Plugin Name: Content Aggregator Block
 * Plugin URI: https://github.com/happyprime/content-aggregator-block/
 * Description: Display the latest posts for a specified post type, taxonomy, and term.
 * Version: 0.5.3
 * Author: Happy Prime
 * Author URI: https://happyprime.co/
 * Requires at least: 5.9
 * Requires PHP: 7.2
 * License: GPL2
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package content-aggregator-block
 */

// Require plugin files.
require_once __DIR__ . '/includes/api.php';
require_once __DIR__ . '/includes/block.php';
require_once __DIR__ . '/includes/cache.php';
