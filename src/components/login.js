import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Button from './button';
import Logo from '../assets/logo.svg';

import {JSON_HEADERS} from '../constants';
import {
  GRAY_DARK,
  PADDING_BASE,
  PADDING_LARGE,
  PADDING_SMALL
} from '../variables';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: ${GRAY_DARK};
  position: absolute;
  top: 0;
  left: 0;
`;

const Content = styled.div`
  width: 20rem;
  p {
    font-size: @font-size-small;
    text-align: center;
  }
  svg, button {
    display: block;
    margin: 0 auto;
  }
  svg {
    width: 25%;
    margin-bottom: ${PADDING_LARGE};
  }
  input {
    width: 100%;
    margin-bottom: ${PADDING_SMALL};
    border-color: ${props => props.error && '@brand-error'};
  }
  button {
    margin-top: ${PADDING_BASE};
  }
`;

const Login = React.createClass({
  propTypes: {
    onSuccess: PropTypes.func.isRequired
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
      <Wrapper>
        <Content error={this.state.error}>
          <Logo />
          <form onSubmit={this.onSubmit}>
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
        </Content>
      </Wrapper>
    );
  }
});

export default Login;
