const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const moment = require('moment');

const Button = require('./button');

const Header = React.createClass({

  propTypes: {
    changedAt: React.PropTypes.instanceOf(Date),
    onPublishClick: React.PropTypes.func.isRequired,
    onSaveClick: React.PropTypes.func.isRequired,
    updatedAt: React.PropTypes.instanceOf(Date)
  },

  render: function() {
    let lastSaved = 'Save your project to publish it';
    let savedStatus = 'Not saved';
    if (this.props.updatedAt) {
      lastSaved = `Last saved ${moment().calendar(this.props.updatedAt, {
        sameElse: '[on] MMMM D, YYYY'
      }).toLowerCase()}`;
      if (this.props.changedAt) {
        const saved = this.props.updatedAt.getTime() === this.props.changedAt.getTime();
        savedStatus = saved ? 'Saved' : 'Unsaved changes';
      }
    }

    const statusClassName = classNames('sv-header-content-status',
        `sv-${savedStatus.split(' ').join('-').toLowerCase()}`);
    return (
      <div className="sv-header">
        <img className="sv-header-logo" src="assets/logo.svg"/>
        <div className="sv-header-content">
          <div className={statusClassName}>
            <span>{savedStatus}</span>
            <span>{lastSaved}</span>
          </div>
          <Button onClick={this.props.onSaveClick}>Save</Button>
          <Button onClick={this.props.onPublishClick}>Publish</Button>
        </div>
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    changedAt: state.changedAt.present,
    updatedAt: state.updatedAt
  };
})(Header);
