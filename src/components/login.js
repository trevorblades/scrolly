const React = require('react');

const Button = require('./button');

const {API_URL, JSON_HEADERS} = require('../constants');

const Login = React.createClass({

  propTypes: {
    onSuccess: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      email: '',
      error: false,
      password: '',
      passwordConfirm: '',
      signingUp: false,
      submitting: false
    };
  },

  _onSubmit: function(event) {
    event.preventDefault();

    const body = {
      email: this.state.email,
      password: this.state.password
    };
    if (this.state.signingUp) {
      body.passwordConfirm = this.state.passwordConfirm;
    }
    const options = {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(body)
    };
    fetch(`${API_URL}/${this.state.signingUp ? 'users' : 'auth'}`, options)
      .then(res => {
        if (!res.ok) {
          throw new Error();
        }
        this.setState({submitting: false});
        return res.text();
      })
      .then(this.props.onSuccess)
      .catch(() => {
        this.setState({
          error: true,
          submitting: false
        });
      });
    this.setState({submitting: true});
  },

  _onInputChange: function(event) {
    this.setState({[event.target.name]: event.target.value});
  },

  _toggleSignUpForm: function() {
    this.setState({signingUp: !this.state.signingUp});
  },

  render: function() {
    return (
      <div className="sv-login">
        <div className="sv-login-content">
          <img src="/assets/logo.svg" title="Scrolly"/>
          <form className={this.state.error ? 'sv-error' : null}
              onSubmit={this._onSubmit}>
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
            {this.state.signingUp &&
              <input name="passwordConfirm"
                  onChange={this._onInputChange}
                  placeholder="Confirm password"
                  type="password"
                  value={this.state.passwordConfirm}/>}
            <Button disabled={this.state.submitting}
                large
                secondary
                type="submit">
              {this.state.submitting ? 'Submitting...' :
                  this.state.signingUp ? 'Create account' : 'Log in'}
            </Button>
          </form>
          <p>
            <a onClick={this._toggleSignUpForm}>
              {`Click here to ${this.state.signingUp ? 'log in' : 'create an account'}`}
            </a>
          </p>
        </div>
      </div>
    );
  }
});

module.exports = Login;
