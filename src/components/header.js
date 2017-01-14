const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');

const Button = require('./button');

const formatDate = require('../util/format-date');

const Header = React.createClass({

  propTypes: {
    changedAt: React.PropTypes.string,
    dispatch: React.PropTypes.func.isRequired,
    onEditClick: React.PropTypes.func.isRequired,
    onNewClick: React.PropTypes.func.isRequired,
    onOpenClick: React.PropTypes.func.isRequired,
    onSaveClick: React.PropTypes.func.isRequired,
    onShareClick: React.PropTypes.func.isRequired,
    saving: React.PropTypes.bool.isRequired,
    updatedAt: React.PropTypes.string
  },

  render: function() {
    let changed = !!this.props.changedAt;
    let lastSaved = 'Save your project to share it';
    let savedStatus = !this.props.changedAt ? 'Nothing to save' : 'Not saved';
    if (this.props.updatedAt) {
      const updatedAt = new Date(this.props.updatedAt);
      lastSaved = `Last saved ${formatDate(updatedAt)}`;
      if (this.props.changedAt) {
        changed = new Date(this.props.changedAt).getTime() !== updatedAt.getTime();
        savedStatus = changed ? 'Unsaved changes' : 'Saved';
      }
    }

    const statusClassName = classNames('sv-header-controls-status',
        `sv-${savedStatus.split(' ').join('-').toLowerCase()}`);

    return (
      <div className="sv-header">
        <img className="sv-header-logo" src="/assets/logo.svg"/>
        <div className="sv-header-nav">
          <Button onClick={this.props.onNewClick}>New</Button>
          <Button onClick={this.props.onEditClick}>Edit</Button>
          <Button onClick={this.props.onOpenClick}>Open</Button>
        </div>
        <div className="sv-header-controls">
          <div className={statusClassName}>
            <span>{this.props.saving ? 'Saving project...' : savedStatus}</span>
            <span>{lastSaved}</span>
          </div>
          <Button className="sv-header-controls-save"
              disabled={!changed || this.props.saving}
              onClick={this.props.onSaveClick}>
            <span>Save</span>
            <span dangerouslySetInnerHTML={{__html: `(${navigator.userAgent.indexOf('Mac OS X') !== -1 ? '&#8984;' : 'Ctrl'} + S)`}}/>
          </Button>
          <Button disabled={!this.props.updatedAt}
              onClick={this.props.onShareClick}>
            Share
          </Button>
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
