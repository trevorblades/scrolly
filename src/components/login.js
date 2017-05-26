import React from 'react';

import Button from './button';

import {API_URL, JSON_HEADERS} from '../constants';

const Login = React.createClass({
  propTypes: {
    onSuccess: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      email: '',
      error: false,
      password: '',
      passwordConfirm: '',
      signingUp: false,
      submitting: false
    };
  },

  onSubmit(event) {
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

  onInputChange(event) {
    this.setState({[event.target.name]: event.target.value});
  },

  toggleSignUpForm() {
    this.setState({signingUp: !this.state.signingUp});
  },

  render() {
    let buttonText;
    if (this.state.submitting) {
      buttonText = 'Submitting...';
    } else if (this.state.signingUp) {
      buttonText = 'Create account';
    } else {
      buttonText = 'Log in';
    }

    return (
      <div className="sv-login">
        <div className="sv-login-content">
          <img alt="Scrolly logo" src="/assets/logo.svg" title="Scrolly" />
          <form
            className={this.state.error ? 'sv-error' : null}
            onSubmit={this.onSubmit}
          >
            <input
              name="email"
              onChange={this.onInputChange}
              placeholder="Email"
              type="text"
              value={this.state.email}
            />
            <input
              name="password"
              onChange={this.onInputChange}
              placeholder="Password"
              type="password"
              value={this.state.password}
            />
            {this.state.signingUp &&
              <input
                name="passwordConfirm"
                onChange={this.onInputChange}
                placeholder="Confirm password"
                type="password"
                value={this.state.passwordConfirm}
              />}
            <Button
              disabled={this.state.submitting}
              large
              secondary
              type="submit"
            >
              {buttonText}
            </Button>
          </form>
          <p>
            <a onClick={this.toggleSignUpForm}>
              {`Click here to ${this.state.signingUp ? 'log in' : 'create an account'}`}
            </a>
          </p>
        </div>
      </div>
    );
  }
});

export default Login;
