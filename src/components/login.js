const React = require('react');
const url = require('url');

const Button = require('./button');

const {API_URL, JSON_HEADERS} = require('../constants');

const Login = React.createClass({

  propTypes: {
    onSuccess: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    const query = url.parse(window.location.href, true).query;
    return {
      email: '',
      error: false,
      loggingIn: false,
      password: '',
      passwordConfirm: '',
      signingUp: false,
      signUpFormShown: typeof query.signup !== 'undefined'
    };
  },

  _onLogInSubmit: function(event) {
    event.preventDefault();
    const options = {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    };
    fetch(`${API_URL}/auth`, options)
      .then(res => {
        this.setState({
          error: !res.ok,
          loggingIn: false
        });
        if (res.ok) {
          return res.text();
        }
      })
      .then(this.props.onSuccess);
    this.setState({loggingIn: true});
  },

  _onSignUpSubmit: function(event) {
    event.preventDefault();
    const options = {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
        passwordConfirm: this.state.passwordConfirm
      })
    };
    fetch(`${API_URL}/users`, options)
      .then(res => {
        this.setState({
          error: !res.ok,
          signingUp: true
        });
      });
    this.setState({signingUp: true});
  },

  _onInputChange: function(event) {
    this.setState({[event.target.name]: event.target.value});
  },

  render: function() {
    const onSubmit = this.state.signUpFormShown ?
        this._onSignUpSubmit : this._onLogInSubmit;
    return (
      <div className="sv-login">
        <div className="sv-login-content">
          <img src="/assets/logo.svg" title="Scrolly"/>
          <form className={this.state.error ? 'sv-error' : null}
              onSubmit={onSubmit}>
            <input name="email"
                onChange={this._onInputChange}
                placeholder="Email"
                type="text"
                value={this.state.email}/>
            <input name="password"
                onChange={this._onInputChange}
                placeholder="Password"
                type="password"
                value={this.state.password}/>
            {this.state.signUpFormShown &&
              <input name="passwordConfirm"
                  onChange={this._onInputChange}
                  placeholder="Confirm password"
                  type="password"
                  value={this.state.passwordConfirm}/>}
            <Button large secondary type="submit">
              {this.state.signUpFormShown ? 'Sign up' : 'Log in'}
            </Button>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = Login;
