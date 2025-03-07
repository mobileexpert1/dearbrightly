import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import thunkMiddleware from 'redux-thunk';

import { rootEpic } from './rootEpic';
import { loadState } from 'src/common/helpers/localStorage';
import { rootReducer } from './rootReducer';


const epicMiddleware = createEpicMiddleware();

export const configureStore = () => {
    const persistedState = loadState();
    const store = createStore(
        rootReducer,
        persistedState,
        compose(
            applyMiddleware(epicMiddleware, thunkMiddleware),
            window.devToolsExtension ? window.devToolsExtension() : f => f, // redux-tool google chrome extension
            window.__REDUX_DEVTOOLS_EXTENSION__ ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f, // Redux DevTools firefox extension
        ),
    );

    epicMiddleware.run(rootEpic);

    return store;
};
