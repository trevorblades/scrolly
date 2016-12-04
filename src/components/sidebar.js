const React = require('react');

const Sidebar = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    width: React.PropTypes.number
  },

  render: function() {
    return (
      <div className="pl-sidebar" style={{width: this.props.width}}>
        {this.props.children}
      </div>
    );
  }
});

module.exports = Sidebar;
