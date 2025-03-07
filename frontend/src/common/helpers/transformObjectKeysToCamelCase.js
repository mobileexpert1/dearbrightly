import { reduce, camelCase } from 'lodash';

export const transformObjectKeysToCamelCase = object =>
    reduce(
        object,
        (sum, value, key) => ({
            ...sum,
            [camelCase(key)]: value,
        }),
        {},
    );
