//import { getEnvValue } from 'src/common/helpers/getEnvValue';
import { getProductURL } from 'src/common/helpers/getProductURL';

//const KLAVIYO_PUBLIC_API_TOKEN = getEnvValue('KLAVIYO_PUBLIC_API_TOKEN');

const PRODUCT_CATEGORIES = {
    'retinoid': '1',
    'retinoid set': '2',
    'moisturizer': '3',
    'vitamin-c': '4',
    'sunblock': '5',
    'bottle': '6',
    'cleanser': '7',
}

const PRODUCT_NAMES = {
    'Night Shift': '1',
    'Night Shift Set': '2',
    'Salve': '3',
    'Glowgetter': '4',
    'Glowgetter Set': '5',
    'Glowgetter Lite': '6',
    'Glowgetter Lite Set': '7',
    'Liquid Cloak': '8',
    'Liquid Cloak Refill': '9',
}

// Inserting the Script into the DOM doesn't work
// export const loadKlaviyo = (callback) => {
//   const existingScript = document.getElementById('klaviyo');
//
//   if (!existingScript) {
//     const script = document.createElement('script');
//     script.src = `https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=<${KLAVIYO_PUBLIC_API_TOKEN}>`;
//     script.id = 'klaviyo';
//     script.defer = "defer";
//
//     document.body.pushChild(s);
//
//     script.onload = () => {
//       if (callback) callback();
//     };
//   }
//   if (existingScript && callback) callback();
// };

export const klaviyoIdentifyUser = (user) => {
  var _learnq = window._learnq || [];
  var userData = {};

  if (user.email) {
    userData['$email'] = user.email;
  }

  if (user.id) {
    userData['$id'] = user.id;
  }

  _learnq.push(['identify', userData]);
};

export const klaviyoTrackViewedProduct = (data, originURL) => {
  var _learnq = window._learnq || [];

  // Make sure that the user is identified before calling track
  if (_learnq.identify && (typeof _learnq.identify === "function")) {
    if (!_learnq.identify().$email) {
      return false;
    }
  } else {
    return false;
  }

  //const productURL = getProductURL(originURL, data.name);
  const mappedProductName = PRODUCT_NAMES[data.name] || '';
  const mappedCategoryName = PRODUCT_CATEGORIES[data.productCategory] || '';

  var item = {
    "ProductName": mappedProductName,
    "ProductID": data.id,
    "Categories": [mappedCategoryName],
    "Price": data.trialPrice/100,
    "Brand": "Dear Brightly"
    // "ImageURL": data.image,
    // "URL": productURL
  };

  _learnq.push(["track", "Viewed Product", item]);

  const trackViewedItem = {
    "Title": item.ProductName,
    "ItemId": item.ProductID,
    "Categories": item.Categories,
    // "ImageUrl": item.ImageURL,
    // "Url": item.URL,
    "Metadata": {
      "Brand": item.Brand,
      "Price": item.Price
    }
  };

  _learnq.push(["trackViewedItem", trackViewedItem]);
  return true;
};


const getKlaviyoItemFromShoppingBagItem = (product, originURL) => {
  //const productURL = getProductURL(originURL, product.productName);
  const mappedProductName = PRODUCT_NAMES[product.productName] || '';
  const mappedCategoryName = PRODUCT_CATEGORIES[product.productCategory] || '';

  const item = {
    "ProductID": product.productUuid,
    "ProductName": mappedProductName,
    "Quantity": product.quantity,
    "ItemPrice": product.trialPrice/100,
    "RowTotal": (product.quantity * product.trialPrice)/100,
    "ProductCategories": [mappedCategoryName]
    //"ProductURL": productURL,
    //"ImageURL": product.image,
    //"SKU": product.sku
  };
  return item;
}


export const klaviyoTrackAddedToCart = (productAdded, shoppingBagItems, originURL) => {
  var _learnq = window._learnq || [];

  // Make sure that the user is identified before calling track
  if (_learnq.identify && (typeof _learnq.identify === "function")) {
    if (!_learnq.identify().$email) {
      return false;
    }
  } else {
    return false;
  }

  //const productURL = getProductURL(originURL, productAdded.name);
  const mappedProductName = PRODUCT_NAMES[productAdded.productName] || '';
  const mappedCategoryName = PRODUCT_CATEGORIES[productAdded.category] || '';
  const itemAdded = getKlaviyoItemFromShoppingBagItem(productAdded, originURL);

  var items = [itemAdded];
  var itemNames = [mappedProductName];
  var itemCategories = [mappedCategoryName];
  var i = 0;
  for (i = 0; i < shoppingBagItems.length; i++) {
    const item = getKlaviyoItemFromShoppingBagItem(shoppingBagItems[i], originURL)
    items.push(item);
    itemNames.push(item.ProductName);
    itemCategories = itemCategories.concat(item.ProductCategories);
  }

  var addedToCartProperties = {
    "$value": productAdded.trialPrice/100,
    "AddedItemProductName": mappedProductName,
    "AddedItemProductID": productAdded.productUuid,
    "AddedItemCategories": [mappedCategoryName],
    "AddedItemPrice": productAdded.trialPrice/100,
    "AddedItemQuantity": 1,
    "ItemNames": itemNames,
    "Items": items
    //"AddedItemImageURL": productAdded.image,
    //"AddedItemURL": productURL,
    //"AddedItemSKU": productAdded.sku
  };

  _learnq.push(["track", "Added to Cart", addedToCartProperties]);
  return true;
}

export const klaviyoTrackStartedCheckout = (order, originURL) => {
  var _learnq = window._learnq || [];

  // Make sure that the user is identified before calling track
  if (_learnq.identify && (typeof _learnq.identify === "function")) {
    if (!_learnq.identify().$email) {
      return false;
    }
  } else {
    return false;
  }

  const products = order.orderProducts;
  var items = [];
  var itemNames = [];
  var itemCategories = [];
  var i = 0;
  for (i = 0; i < products.length; i++) {
    const item = getKlaviyoItemFromShoppingBagItem(products[i], originURL)
    items.push(item);
    itemNames.push(item.ProductName);
    itemCategories = itemCategories.concat(item.ProductCategories);
  }

  const timestamp = Math.round((new Date()).getTime() / 1000);
  const eventId = `${order.id}_${timestamp}`
  const eventData = {
    "$event_id": eventId,
    "$value": order.totalAmount/100,
    "ItemNames": itemNames,
    "Categories": itemCategories,
    "Items": items
  }

  _learnq.push(['track', 'Started Checkout', eventData]);

  return true;
}
