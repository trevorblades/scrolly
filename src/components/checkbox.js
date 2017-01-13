const React = require('react');
const classNames = require('classNames');

const Checkbox = React.createClass({

  propTypes: {
    checked: React.PropTypes.bool.isRequired,
    label: React.PropTypes.node,
    onChange: React.PropTypes.func.isRequired
  },

  _onClick: function() {
    this.props.onChange(!this.props.checked);
  },

  render: function() {
    const checkboxClassName = classNames('sv-checkbox', {
      'sv-checked': this.props.checked
    });
    return (
      <div className={checkboxClassName} onClick={this._onClick}>
        <div className="sv-checkbox-indicator"/>
        {this.props.label && <label>{this.props.label}</label>}
      </div>
    );
  }
});

module.exports = Checkbox;
