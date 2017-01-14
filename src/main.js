const React = require('react');
const {render} = require('react-dom');
const {createStore} = require('redux');
const {Provider, connect} = require('react-redux');
const jwtDecode = require('jwt-decode');
require('core-js/fn/array/find');
require('whatwg-fetch');

const App = require('./components/app');
const Login = require('./components/login');

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
          history.pushState(null, null, '/');
        });
    }
    return {
      loading,
      loggingIn: false,
      user: null
    };
  },

  _onLogInSuccess: function(token) {
    const user = jwtDecode(token);
    user.token = token;
    this.setState({user});
  },

  _onLogOutClick: function() {
    this.setState({user: null});
  },

  render: function() {
    if (!this.state.user) {
      return <Login onSuccess={this._onLogInSuccess}/>;
    }
    return this.state.loading ? null : <App onLogOutClick={this._onLogOutClick}/>;
  }
}));

render(
  <Provider store={createStore(reducer)}>
    <Wrapper/>
  </Provider>,
  document.getElementById('sv-root')
);
