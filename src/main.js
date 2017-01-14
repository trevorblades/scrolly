const React = require('react');
const {render} = require('react-dom');
const {createStore} = require('redux');
const {Provider, connect} = require('react-redux');
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

  _onLoginSubmit: function(email, password) {
    const options = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password})
    };
    fetch(`${API_URL}/auth`, options)
      .then(function(res) {
        if (!res.ok) {
          throw new Error();
        }
        return res.text();
      })
      .then(token => {
        const user = {
          token: token
        };
        this.setState({
          loggingIn: false,
          user
        });
      })
      .catch(() => {
        this.setState({loggingIn: false});
      });
    this.setState({loggingIn: true});
  },

  _onLogOutClick: function() {
    this.setState({user: null});
  },

  render: function() {
    if (!this.state.user) {
      return <Login onSubmit={this._onLoginSubmit}/>;
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
