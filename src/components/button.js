const React = require('react');
const classNames = require('classnames');

const Button = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    secondary: React.PropTypes.bool,
    title: React.PropTypes.string,
    type: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      type: 'button'
    };
  },

  _onMouseDown: function(event) {
    event.preventDefault();
    event.target.blur();
  },

  render: function() {
    const buttonClassName = classNames('sv-button', this.props.className, {
      'sv-secondary': this.props.secondary
    });
    return (
      <button className={buttonClassName}
          disabled={this.props.disabled}
          onClick={this.props.onClick}
          onMouseDown={this._onMouseDown}
          title={this.props.title}
          type={this.props.type}>
        {this.props.children}
      </button>
    );
  }
});

module.exports = Button;
