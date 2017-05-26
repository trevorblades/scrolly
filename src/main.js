import React from 'react';
import {render} from 'react-dom';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import {devToolsEnhancer} from 'redux-devtools-extension/logOnlyInProduction';
import jwtDecode from 'jwt-decode';
import 'core-js/fn/array/find';
import 'whatwg-fetch';

import App from './components/app';
import Login from './components/login';

import {loadProject} from './actions';
import {API_URL} from './constants';
import reducer from './reducers';

const TOKEN_KEY = 'sv-token';

const Wrapper = connect()(
  React.createClass({
    propTypes: {
      dispatch: React.PropTypes.func.isRequired
    },

    getInitialState() {
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
          user = {...{token}, ...claims};
        }
      }

      return {
        loading: this.loadProject(user),
        user
      };
    },

    onLogInSuccess(token) {
      const user = jwtDecode(token);
      user.token = token;
      localStorage.setItem(TOKEN_KEY, token);
      this.setState({
        loading: this.loadProject(user),
        user
      });
    },

    onLogOutClick() {
      localStorage.removeItem(TOKEN_KEY);
      this.setState({user: null});
    },

    loadProject(user) {
      let loading = false;
      if (user) {
        const slug = window.location.pathname.split('/').filter(Boolean)[0];
        if (slug) {
          loading = true;
          const headers = {Authorization: `Bearer ${user.token}`};
          fetch(`${API_URL}/projects/${slug}`, {headers})
            .then(res => {
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

    render() {
      if (!this.state.user) {
        return <Login onSuccess={this.onLogInSuccess} />;
      }
      return this.state.loading
        ? null
        : <App onLogOutClick={this.onLogOutClick} user={this.state.user} />;
    }
  })
);

render(
  <Provider store={createStore(reducer, devToolsEnhancer({}))}>
    <Wrapper />
  </Provider>,
  document.getElementById('sv-root')
);
