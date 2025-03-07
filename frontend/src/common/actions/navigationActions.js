export const REDIRECT_TO_URL = 'REDIRECT_TO_URL';
export const redirectToUrl = path => ({
    type: REDIRECT_TO_URL,
    payload: path,
});

export const REDIRECT_TO_URL_SUCCEEDED = 'REDIRECT_TO_URL_SUCCEEDED';
export const redirectToUrlSuccess = () => ({
    type: REDIRECT_TO_URL_SUCCEEDED,
});
