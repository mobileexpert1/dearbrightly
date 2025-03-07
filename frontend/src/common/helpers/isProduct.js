export const isProduct = (productCategory, product) => {
    const isRetinoid = productCategory.includes(product);
    return isRetinoid;
};
