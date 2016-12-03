const React = require('react');

const Footer = React.createClass({

  propTypes: {
    children: React.PropTypes.node
  },

  render: function() {
    return (
      <div className="pl-footer">
        {this.props.children}
      </div>
    );
  }
});

module.exports = Footer;
