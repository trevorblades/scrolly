import React from 'react';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {devToolsEnhancer} from 'redux-devtools-extension/logOnlyInProduction';

import AppWrapper from './components/app-wrapper';
import reducer from './reducers';

const Main = () => (
  <Provider store={createStore(reducer, devToolsEnhancer({}))}>
    <AppWrapper />
  </Provider>
);

export default Main;
