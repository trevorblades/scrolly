const React = require('react');
const {render} = require('react-dom');
const {createStore} = require('redux');
const {Provider} = require('react-redux');
const App = require('./components/app');
const reducer = require('./reducers');

render(
  <Provider store={createStore(reducer)}>
    <App/>
  </Provider>,
  document.getElementById('pl-root'));
