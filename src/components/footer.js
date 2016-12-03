const React = require('react');

const Handle = require('./handle');

const Footer = React.createClass({

  propTypes: {
    children: React.PropTypes.node
  },

  render: function() {
    return (
      <div className="pl-footer">
        {this.props.children}
        <Handle position="top"/>
      </div>
    );
  }
});

module.exports = Footer;
