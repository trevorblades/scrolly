import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const Button = React.createClass({
  propTypes: {
    children: PropTypes.node,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    large: PropTypes.bool,
    onClick: PropTypes.func,
    secondary: PropTypes.bool,
    title: PropTypes.string,
    type: PropTypes.string
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
