const React = require('react');

const Dialog = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    onClose: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div className="sv-dialog">
        <div className="sv-dialog-overlay"
            onClick={this.props.onClose}/>
        <div className="sv-dialog-window">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Dialog;
