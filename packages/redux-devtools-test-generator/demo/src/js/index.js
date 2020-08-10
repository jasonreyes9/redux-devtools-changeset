import '@babel/polyfill';
import 'devui/lib/presets';
import React from 'react';
import { render } from 'react-dom';
import { Container } from 'devui';
import DemoApp from './DemoApp';
import { Provider } from 'react-redux';
import createRootReducer from './reducers';
import { createStore, applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';
import { Route } from 'react-router';
import { createBrowserHistory } from 'history';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { persistState } from 'redux-devtools';
import getOptions from './getOptions';
import { ConnectedDevTools, getDevTools } from './DevTools';

function getDebugSessionKey() {
  const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
  return matches && matches.length > 0 ? matches[1] : null;
}

const ROOT =
  process.env.NODE_ENV === 'production'
    ? '/redux-devtools-test-generator/'
    : '/';

const DevTools = getDevTools(window.location);

const history = createBrowserHistory();

const useDevtoolsExtension =
  !!window.__REDUX_DEVTOOLS_EXTENSION__ &&
  getOptions(window.location).useExtension;

const enhancer = compose(
  applyMiddleware(logger, routerMiddleware(history)),
  (...args) => {
    const instrument = useDevtoolsExtension
      ? window.__REDUX_DEVTOOLS_EXTENSION__()
      : DevTools.instrument();
    return instrument(...args);
  },
  persistState(getDebugSessionKey())
);

const store = createStore(createRootReducer(history), {}, enhancer);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Container
        themeData={{ theme: 'default', scheme: 'default', light: true }}
      >
        <Route path={ROOT}>
          <DemoApp />
        </Route>
        {!useDevtoolsExtension && <ConnectedDevTools />}
      </Container>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
