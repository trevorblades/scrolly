const React = require('react');

const Button = require('./button');

const Login = React.createClass({

  propTypes: {
    onSubmit: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      email: '',
      password: ''
    };
  },

  _onSubmit: function(event) {
    event.preventDefault();
    this.props.onSubmit(this.state.email, this.state.password);
  },

  _onInputChange: function(event) {
    this.setState({[event.target.name]: event.target.value});
  },

  render: function() {
    return (
      <div className="sv-login">
        <div className="sv-login-content">
          <img src="/assets/logo.svg" title="Scrolly"/>
          <form onSubmit={this._onSubmit}>
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
            <Button large secondary type="submit">Log in</Button>
          </form>
        </div>
      </div>
    );
  }
});

module.exports = Login;
