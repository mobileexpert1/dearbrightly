export const getProductNames = (subscriptionBundleOptions) =>  {
    let subscriptionBundleProductNamesList = subscriptionBundleOptions.map(subscriptionBundle => subscriptionBundle.productName);
    const subscriptionBundleProductNames = subscriptionBundleProductNamesList.join(', ')
    return subscriptionBundleProductNames;
}
