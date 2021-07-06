# Content Aggregator Block

## Release process

In the latest `release` branch:

* `npm run build`
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
