const React = require('react');

const Button = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    disabled: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    type: React.PropTypes.string
  },

  getDefaultProps: function() {
    return {
      type: 'button'
    };
  },

  render: function() {
    return (
      <button className="pl-button"
          disabled={this.props.disabled}
          onClick={this.props.onClick}
          type={this.props.type}>
        {this.props.children}
      </button>
    );
  }
});

module.exports = Button;
