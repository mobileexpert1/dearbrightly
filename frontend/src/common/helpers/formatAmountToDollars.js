export const formatAmountToDollarsWithCents = amount => `$${(amount / 100).toFixed(2).replace(".00", "")}`;
export const formatAmountToRoundedDollars = amount => `$${Math.round(amount / 100).toString().replace(".00", "")}`;

export const formatAmountToDollars = (order, amount) => {
    if (order && order.containsDecimalValues || (amount % 100 > 0)) {
        return formatAmountToDollarsWithCents(amount).replace(".00", "")
    }
    return formatAmountToRoundedDollars(amount).replace(".00", "");
};
