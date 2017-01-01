const React = require('react');

const Header = React.createClass({

  propTypes: {
    children: React.PropTypes.node
  },

  render: function() {
    return (
      <div className="sv-header">
        <div className="sv-header-content">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Header;
