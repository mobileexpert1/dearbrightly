export const compareOrdersByDate = ascending => (a, b) => {
    const dateA = new Date(a.purchasedDatetime).getTime();
    const dateB = new Date(b.purchasedDatetime).getTime();

    if (dateA == dateB) {
        return a.id.localeCompare(b.id);
    }

    return ascending ? dateA - dateB : dateB - dateA;
};
