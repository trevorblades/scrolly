const React = require('react');
const {render} = require('react-dom');
const {createStore} = require('redux');
const {Provider, connect} = require('react-redux');
const {devToolsEnhancer} = require('redux-devtools-extension/logOnlyInProduction');
const jwtDecode = require('jwt-decode');
require('core-js/fn/array/find');
require('whatwg-fetch');

const App = require('./components/app');
const Login = require('./components/login');

const {loadProject} = require('./actions');
const {API_URL} = require('./constants');
const reducer = require('./reducers');

const TOKEN_KEY = 'sv-token';

const Wrapper = connect()(React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    let user = null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      let claims;
      try {
        claims = jwtDecode(token);
      } catch (err) {
        // token has been tampered with
      }

      if (claims && claims.exp && claims.exp * 1000 > Date.now()) {
        user = Object.assign({token: token}, claims);
      }
    }

    return {
      loading: this._loadProject(user),
      user
    };
  },

  _onLogInSuccess: function(token) {
    const user = jwtDecode(token);
    user.token = token;
    localStorage.setItem(TOKEN_KEY, token);
    this.setState({
      loading: this._loadProject(user),
      user
    });
  },

  _onLogOutClick: function() {
    localStorage.removeItem(TOKEN_KEY);
    this.setState({user: null});
  },

  _loadProject: function(user) {
    let loading = false;
    if (user) {
      const slug = window.location.pathname.split('/').filter(Boolean)[0];
      if (slug) {
        loading = true;
        const headers = {'Authorization': `Bearer ${user.token}`};
        fetch(`${API_URL}/projects/${slug}`, {headers})
          .then(function(res) {
            if (!res.ok) {
              throw new Error();
            }
            return res.json();
          })
          .then(project => {
            if (project.user_id !== user.id) {
              throw new Error();
            }
            this.setState({loading: false});
            this.props.dispatch(loadProject(project));
          })
          .catch(() => {
            this.setState({loading: false});
            history.pushState(null, null, '/');
          });
      }
    }
    return loading;
  },

  render: function() {
    if (!this.state.user) {
      return <Login onSuccess={this._onLogInSuccess}/>;
    }
    return this.state.loading ?
        null :
        <App onLogOutClick={this._onLogOutClick}
            user={this.state.user}/>;
  }
}));

render(
  <Provider store={createStore(reducer, devToolsEnhancer({

  }))}>
    <Wrapper/>
  </Provider>,
  document.getElementById('sv-root')
);
