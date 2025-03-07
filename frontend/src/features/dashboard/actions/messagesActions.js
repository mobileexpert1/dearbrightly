export const FETCH_MESSAGES_REQUEST = 'FETCH_MESSAGES_REQUEST';
export const fetchMessagesRequest = () => ({
    type: FETCH_MESSAGES_REQUEST,
});

export const FETCH_MESSAGES_SUCCESS = 'FETCH_MESSAGES_SUCCESS';
export const fetchMessagesSuccess = messages => ({
    type: FETCH_MESSAGES_SUCCESS,
    payload: messages,
});

export const FETCH_MESSAGES_FAIL = 'FETCH_MESSAGES_FAIL';
export const fetchMessagesFail = errorMessage => ({
    type: FETCH_MESSAGES_FAIL,
    payload: errorMessage,
});

export const MARK_MESSAGE_AS_READ_REQUEST = 'MARK_MESSAGE_AS_READ_REQUEST';
export const markMessageAsReadRequest = messageId => ({
    type: MARK_MESSAGE_AS_READ_REQUEST,
    payload: messageId,
});

export const MARK_MESSAGE_AS_READ_SUCCESS = 'MARK_MESSAGE_AS_READ_SUCCESS';
export const markMessageAsReadSuccess = messageId => ({
    type: MARK_MESSAGE_AS_READ_SUCCESS,
    payload: messageId,
});

export const MARK_MESSAGE_AS_READ_FAIL = 'MARK_MESSAGE_AS_READ_FAIL';
export const markMessageAsReadFail = errorMessage => ({
    type: MARK_MESSAGE_AS_READ_FAIL,
    payload: errorMessage,
});

export const SEND_MESSAGE_REQUEST = 'SEND_MESSAGE_REQUEST';
export const sendMessageRequest = message => ({
    type: SEND_MESSAGE_REQUEST,
    payload: message,
});

export const SEND_MESSAGE_SUCCESS = 'SEND_MESSAGE_SUCCESS';
export const sendMessageSuccess = message => ({
    type: SEND_MESSAGE_SUCCESS,
    payload: message,
});

export const SEND_MESSAGE_FAIL = 'SEND_MESSAGE_FAIL';
export const sendMessageFail = errorMessage => ({
    type: SEND_MESSAGE_FAIL,
    payload: errorMessage,
});
