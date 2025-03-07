import { user } from 'src/features/user/reducers/userReducer';

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');

    if (serializedState === null) {
      return undefined;
    }

    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = state => {
  try {
    const serializedState = JSON.stringify({ ...state, user: undefined });
    localStorage.setItem('state', serializedState);
    if (!!state.user && state.user.user !== null) {
      localStorage.setItem('uuid', state.user.user.id);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

export const saveIfEmpty = (state, value) => {
  const savedState = localStorage.getItem(state);
  if (!savedState) {
    localStorage.setItem(state, value);
  }
};
