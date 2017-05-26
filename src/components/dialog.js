const React = require('react');
const classNames = require('classnames');

const Dialog = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    onClose: React.PropTypes.func.isRequired
  },

  componentWillMount() {
    window.addEventListener('keydown', this.onKeyDown, true);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown, true);
  },

  onKeyDown(event) {
    event.stopPropagation();
    if (event.keyCode === 27) {
      // esc key pressed
      this.props.onClose();
    }
  },

  render() {
    return (
      <div className={classNames('sv-dialog', this.props.className)}>
        <div className="sv-dialog-overlay" onClick={this.props.onClose} />
        <div className="sv-dialog-window">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = Dialog;
