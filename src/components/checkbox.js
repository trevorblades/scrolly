import React from 'react';
import classNames from 'classnames';
import shortid from 'shortid';

const Checkbox = React.createClass({
  propTypes: {
    checked: React.PropTypes.bool.isRequired,
    label: React.PropTypes.node,
    onChange: React.PropTypes.func.isRequired
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
