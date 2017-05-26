import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const Dialog = React.createClass({
  propTypes: {
    children: PropTypes.node,
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired
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

export default Dialog;
