export const SHOPPING_BAG_ADD = 'SHOPPING_BAG_ADD';
export const shoppingBagAdd = data => ({
    type: SHOPPING_BAG_ADD,
    payload: data,
});

export const SHOPPING_BAG_UPDATE_QUANTITY = 'SHOPPING_BAG_UPDATE_QUANTITY';
export const shoppingBagUpdateQuantity = (id, frequency, quantity) => ({
    type: SHOPPING_BAG_UPDATE_QUANTITY,
    payload: {
        id,
        frequency,
        quantity,
    },
});

export const SHOPPING_BAG_REMOVE_ITEM = 'SHOPPING_BAG_REMOVE_ITEM';
export const shoppingBagRemoveItem = id => ({
    type: SHOPPING_BAG_REMOVE_ITEM,
    payload: id,
});

export const SHOPPING_BAG_UPDATE_FAILED = 'SHOPPING_BAG_UPDATE_FAILED';
export const shoppingBagUpdateFailed = errorMessage => ({
    type: SHOPPING_BAG_UPDATE_FAILED,
    payload: errorMessage,
});

export const SHOPPING_BAG_RESET = 'SHOPPING_BAG_RESET';
export const shoppingBagReset = () => ({
    type: SHOPPING_BAG_RESET,
});
