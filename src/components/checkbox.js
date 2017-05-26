import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import shortid from 'shortid';

const Checkbox = React.createClass({
  propTypes: {
    checked: PropTypes.bool.isRequired,
    label: PropTypes.node,
    onChange: PropTypes.func.isRequired
  },

  componentWillMount() {
    this.id = shortid.generate();
  },

  onClick() {
    this.props.onChange(!this.props.checked);
  },

  render() {
    const checkboxClassName = classNames('sv-checkbox', {
      'sv-checked': this.props.checked
    });
    return (
      <div className={checkboxClassName} onClick={this.onClick}>
        <div className="sv-checkbox-indicator" />
        {this.props.label &&
          <label htmlFor={this.id}>{this.props.label}</label>}
      </div>
    );
  }
});

export default Checkbox;
