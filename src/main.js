const React = require('react');
const {render} = require('react-dom');
const {createStore} = require('redux');
const {Provider, connect} = require('react-redux');
require('core-js/fn/array/find');
require('whatwg-fetch');

const App = require('./components/app');

const {loadProject} = require('./actions');
const {API_URL} = require('./constants');
const reducer = require('./reducers');

const Wrapper = connect()(React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    let loading = false;
    const slug = window.location.pathname.split('/').filter(Boolean)[0];
    if (slug) {
      loading = true;
      fetch(`${API_URL}/projects/${slug}`)
        .then(function(res) {
          if (!res.ok) {
            throw new Error();
          }
          return res.json();
        })
        .then(project => {
          this.setState({loading: false});
          this.props.dispatch(loadProject(project));
        })
        .catch(err => {
          this.setState({loading: false});
          history.pushState(null, null, window.location.origin);
        });
    }
    return {loading};
  },

  render: function() {
    return this.state.loading ? null : <App/>;
  }
}));

render(
  <Provider store={createStore(reducer)}>
    <Wrapper/>
  </Provider>,
  document.getElementById('sv-root')
);
