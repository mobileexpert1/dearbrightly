import { upperCaseToKebabCase } from 'src/common/helpers/formatText';

export const getProductURL = (originURL, productName) => {
	var productURL = '';
	if (productName) {
		const kebabCaseName = upperCaseToKebabCase(productName);
		productURL = `${originURL}/product-details/${kebabCaseName}`;
	}
	return productURL;
};
