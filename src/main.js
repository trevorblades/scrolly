const React = require('react');
const {render} = require('react-dom');
const {createStore} = require('redux');
const {Provider, connect} = require('react-redux');
const request = require('request-promise');
require('core-js/fn/array/find');

const App = require('./components/app');

const {updateProject} = require('./actions');
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
      request.get({url: `${API_URL}/projects/${slug}`, json: true})
        .then(project => {
          this.props.dispatch(updateProject(project));
          this.setState({loading: false});
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
