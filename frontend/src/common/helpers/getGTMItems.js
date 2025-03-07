export const getGTMItems = (products) => {

    var items = [];
    var totalValue = 0;

    for (var i = 0; i < products.length; i++) {
        const item = {
            'quantity': products[i].quantity, // Google Analytics Ecomm required key
            'product_id': products[i].productCategory, // Google Analytics Ecomm required key (TODO - Switch to SKU when Alda makes SKU updates)
            'product_name': products[i].productName,
            'price': products[i].price/100, // Google Analytics Ecomm required key.
        };
        items.push(item);
    }

    return { 'products': items, 'currency': 'USD' };
}