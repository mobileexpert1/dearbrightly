export const SHOW_SUCCESS_TOAST_NOTIFICATION = 'SHOW_SUCCESS_TOAST_NOTIFICATION';
export const showSuccessToastNotification = message => ({
    type: SHOW_SUCCESS_TOAST_NOTIFICATION,
    payload: message,
});

export const SHOW_ERROR_TOAST_NOTIFICATION = 'SHOW_ERROR_TOAST_NOTIFICATION';
export const showErrorToastNotification = message => ({
    type: SHOW_ERROR_TOAST_NOTIFICATION,
    payload: message,
});

export const SHOW_WARNING_TOAST_NOTIFICATION = 'SHOW_WARNING_TOAST_NOTIFICATION';
export const showWarningToastNotification = message => ({
    type: SHOW_WARNING_TOAST_NOTIFICATION,
    payload: message,
});

export const SHOW_TOAST_NOTIFICATION_SUCCEEDED = 'SHOW_TOAST_NOTIFICATION_SUCCEEDED';
export const showToastNotificationSuccess = () => ({
    type: SHOW_TOAST_NOTIFICATION_SUCCEEDED,
});
