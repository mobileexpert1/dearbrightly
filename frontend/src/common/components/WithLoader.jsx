import React from 'react';

export const WithLoader = ({
    hasData,
    isFetching,
    fetchingMessage,
    fetchedSuccessfully,
    noDataErrorMessage,
    errorMessage,
    data,
    children,
}) => {
    if (!hasData) {
        if (isFetching) {
            return <p>{fetchingMessage}</p>;
        }

        return <p>{fetchedSuccessfully ? noDataErrorMessage : errorMessage}</p>;
    }

    const isFunction = typeof children == 'function';

    return isFunction ? children(data) : children;
};
