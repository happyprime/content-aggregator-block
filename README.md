# Content Aggregator Block

## Release process

In the latest `release` branch:

* `wp dist-archive ./ content-aggregator-block.zip --format=zip`
* Tag a release in GitHub and attach `content-aggregator-block.zip` to the release.

## Filters

The following filters are provided to allow customization and extensibility.

### `contentAggregatorBlock.ExcludePostTypes`

This JavaScript filter can be used to modify the options available in the `Post type` dropdown within the `Sorting and Filtering` panel. It receives the default array of post type slugs excluded from the options.

### `contentAggregatorBlock.itemHTML`

This JavaScript filter can be used to modify the markup for an individual post item as displayed on editor views. It receives the default markup, the post data (as returned by the REST API route registered by this plugin), and the block attributes.

### `content_aggregator_block_item`

This PHP filter can be used to modify the markup for an individual post item as displayed on front-end views. It receives the default markup, the post data, and the block attributes.

### `content_aggregator_block_endpoint_post_data`

This PHP filter can be used to modify the data returned by the REST API route registered by this plugin. It receives the default data and the post ID.

## Changelog

### 0.6.0

* Use post meta to identify which content contains content aggregator blocks.
* Clear Kinsta page cache for URLs containing content aggregator blocks when content is updated.
* Fix a class name attribute for byline authors.
* Update project to use Node 18.
* Update `wordpress/scripts` to 26.6.0.

### 0.5.3

* Allow more than 100 items in a Content Aggregator block.
* Update `wordpress/scripts` to 26.1.0.

### 0.5.2

* Add `content_aggregator_block_pre_render_item` filter to allow a plugin or theme to fully take over the display of an item.

### 0.5.1

* Add last modified date to sorting options.

### 0.5.0

* Enable scrolling in the multiple select interface used for terms.
* Add a `cab-item-title` class to the anchor wrapping item titles.
* Fix an issue looping through post IDs instead of objects.

### 0.4.1

* Allow CAB to be filtered by non-public taxonomies.
