import {
    FETCH_MESSAGES_REQUEST,
    FETCH_MESSAGES_SUCCESS,
    FETCH_MESSAGES_FAIL,
    MARK_MESSAGE_AS_READ_SUCCESS,
} from '../actions/messagesActions';

const defaultState = {
    errorMessage: '',
    fetchedSuccessfully: false,
    isFetching: false,
    data: [],
};

export const messages = (state = defaultState, action) => {
    switch (action.type) {
        case FETCH_MESSAGES_REQUEST:
            return {
                ...state,
                isFetching: true,
            };

        case FETCH_MESSAGES_SUCCESS:
            return {
                ...state,
                isFetching: false,
                errorMessage: '',
                fetchedSuccessfully: true,
                data: action.payload.data,
            };

        case FETCH_MESSAGES_FAIL:
            return {
                ...state,
                isFetching: false,
                fetchedSuccessfully: false,
                errorMessage: action.payload,
            };

        case MARK_MESSAGE_AS_READ_SUCCESS: {
            const { id } = action.payload;

            const date = Date.now();
            return {
                ...state,
                data: state.data.map(
                    message => (message.id === id ? (message.readAt = date) : message),
                ),
            };
        }

        default:
            return state;
    }
};
