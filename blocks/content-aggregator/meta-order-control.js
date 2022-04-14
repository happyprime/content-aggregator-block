// WordPress dependencies.
import apiFetch from '@wordpress/api-fetch';

import { SelectControl } from '@wordpress/components';

import { useEffect, useRef, useState } from '@wordpress/element';

import { decodeEntities } from '@wordpress/html-entities';

import { __ } from '@wordpress/i18n';

import { addQueryArgs } from '@wordpress/url';

/**
 * Retrieve the meta keys of the selected post type and
 * render them as as `SelectControl` options.
 *
 * Render a second `SelectControl` with "ASC/DESC" options.
 *
 * @param {Object} props Component properties.
 * @return {WPElement} MetaOrderControl component.
 */
export default function MetaOrderControl(props) {
	const { blockProps } = props;

	const { attributes, setAttributes } = blockProps;

	const { customPostType, orderByMetaKey, orderByMetaOrder } = attributes;

	const [keyOptions, setKeyOptions] = useState([]);

	const isStillMounted = useRef();

	useEffect(() => {
		isStillMounted.current = true;

		apiFetch({
			path: addQueryArgs(`/content-aggregator-block/v1/meta/`, {
				post_type: customPostType,
			}),
		})
			.then((data) => {
				if (isStillMounted.current) {
					const none = [
						{
							label: __('None'),
							value: '',
						},
					];

					const keyData = data.map((key) => {
						return {
							label: decodeEntities(key),
							value: key,
						};
					});

					setKeyOptions(none.concat(keyData));
				}
			})
			.catch(() => {
				if (isStillMounted.current) {
					setKeyOptions([]);
				}
			});

		return () => {
			isStillMounted.current = false;
		};
	}, [customPostType]);

	return (
		<div className="happyprime-block-cab_meta-order-settings">
			<SelectControl
				className="happyprime-block-cab_meta-order-key-select"
				label={__('Meta Key')}
				onChange={(value) => setAttributes({ orderByMetaKey: value })}
				options={keyOptions}
				value={orderByMetaKey}
			/>
			<SelectControl
				className="happyprime-block-cab_meta-order-order-select"
				label={__('Order')}
				onChange={(value) => setAttributes({ orderByMetaOrder: value })}
				options={[
					{
						label: __('ASC'),
						value: 'ASC',
					},
					{
						label: __('DESC'),
						value: 'DESC',
					},
				]}
				value={orderByMetaOrder}
			/>
		</div>
	);
}
