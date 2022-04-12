// WordPress dependencies.
import { __ } from '@wordpress/i18n';

import { FormTokenField } from '@wordpress/components';

import { useSelect } from '@wordpress/data';

import { store as coreStore } from '@wordpress/core-data';

// Module constants.
const AUTHORS_QUERY = {
	who: 'authors',
	per_page: -1,
	_fields: 'id,name',
	context: 'view',
};

/**
 * Return an object mapped for integration with `FormTokenField` component.
 *
 * @param {Object} entities The full authors list.
 * @return {Object} Entities information.
 */
export const getEntitiesInfo = (entities) => {
	const mapping = entities?.reduce(
		(accumulator, entity) => {
			const { mapById, mapByName, names } = accumulator;
			mapById[entity.id] = entity;
			mapByName[entity.name] = entity;
			names.push(entity.name);
			return accumulator;
		},
		{ mapById: {}, mapByName: {}, names: [] }
	);
	return {
		entities,
		...mapping,
	};
};

/**
 * Return the author control component.
 *
 * @param {Object}   props          Component properties.
 * @param {string}   props.value    Current value.
 * @param {Function} props.onChange Onchange function.
 * @return {Element} Author control component.
 */
export default function AuthorControl({ value, onChange }) {
	const authorsList = useSelect((select) => {
		const { getUsers } = select(coreStore);

		return getUsers(AUTHORS_QUERY);
	}, []);

	if (!authorsList) {
		return null;
	}

	const authorsInfo = getEntitiesInfo(authorsList);

	// The value needs to be normalized because the block operates on a
	// comma separated string value and `FormTokenFields` uses an array.
	const normalizedValue = !value ? [] : value.toString().split(',');

	// Return only existing authors ids to prevent
	// crashing when non-existent ids are provided.
	const sanitizedValue = normalizedValue.reduce((accumulator, authorId) => {
		const author = authorsInfo.mapById[authorId];

		if (author) {
			accumulator.push({
				id: authorId,
				value: author.name,
			});
		}

		return accumulator;
	}, []);

	const getIdByValue = (entitiesMappedByName, authorValue) => {
		const id = authorValue?.id || entitiesMappedByName[authorValue]?.id;

		if (id) {
			return id;
		}
	};

	const onAuthorChange = (newValue) => {
		const ids = Array.from(
			newValue.reduce((accumulator, author) => {
				// Verify that new values point to existing entities.
				const id = getIdByValue(authorsInfo.mapByName, author);

				if (id) {
					accumulator.add(id);
				}

				return accumulator;
			}, new Set())
		);

		onChange(ids.join(','));
	};

	return (
		<FormTokenField
			label={__('Authors')}
			value={sanitizedValue}
			suggestions={authorsInfo.names}
			onChange={onAuthorChange}
		/>
	);
}
