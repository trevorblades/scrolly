import React from 'react';
import classNames from 'classnames';

const Button = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    large: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    secondary: React.PropTypes.bool,
    title: React.PropTypes.string,
    type: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      type: 'button'
    };
  },

  onMouseDown(event) {
    event.preventDefault();
    event.target.blur();
  },

  render() {
    const buttonClassName = classNames('sv-button', this.props.className, {
      'sv-large': this.props.large,
      'sv-secondary': this.props.secondary
    });
    return (
      <button
        className={buttonClassName}
        disabled={this.props.disabled}
        onClick={this.props.onClick}
        onMouseDown={this.onMouseDown}
        title={this.props.title}
        type={this.props.type}
      >
        {this.props.children}
      </button>
    );
  }
});

export default Button;
