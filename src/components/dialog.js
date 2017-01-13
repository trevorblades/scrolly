const React = require('react');
const classNames = require('classnames');

const Dialog = React.createClass({

  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    onClose: React.PropTypes.func.isRequired
  },

  componentWillMount: function() {
    window.addEventListener('keydown', this._onKeyDown, true);
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown, true);
  },

  _onKeyDown: function(event) {
    event.stopPropagation();
    if (event.keyCode === 27) { // esc key pressed
      this.props.onClose();
    }
  },

  render: function() {
    return (
      <div className={classNames('sv-dialog', this.props.className)}>
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
