const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const moment = require('moment');

const Button = require('./button');
const TextField = require('./text-field');

const Header = React.createClass({

  propTypes: {
    changedAt: React.PropTypes.string,
    dispatch: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
    onPublishClick: React.PropTypes.func.isRequired,
    onSaveClick: React.PropTypes.func.isRequired,
    saving: React.PropTypes.bool.isRequired,
    updatedAt: React.PropTypes.string
  },

  _onNameChange: function(value) {
    this.props.dispatch({
      type: 'SET_NAME',
      value
    });
  },

  _onNewClick: function() {
    history.replaceState(null, null, '/');
    this.props.dispatch({type: 'RESET'});
  },

  _onOpenClick: function() {

  },

  render: function() {
    let lastSaved = 'Save your project to publish it';
    let savedStatus = this.props.saving ? 'Saving project...' :
        this.props.changedAt === null ? 'Nothing to save' : 'Not saved';
    if (this.props.updatedAt) {
      const updatedAt = new Date(this.props.updatedAt);
      lastSaved = `Last saved ${moment().calendar(updatedAt, {
        sameElse: '[on] MMMM D, YYYY'
      }).toLowerCase()}`;
      if (this.props.changedAt && !this.props.saving) {
        const saved = updatedAt.getTime() === new Date(this.props.changedAt).getTime();
        savedStatus = saved ? 'Saved' : 'Unsaved changes';
      }
    }

    const statusClassName = classNames('sv-header-content-status',
        `sv-${savedStatus.split(' ').join('-').toLowerCase()}`);
    return (
      <div className="sv-header">
        <img className="sv-header-logo" src="/assets/logo.svg"/>
        <div className="sv-header-name">
          <TextField onChange={this._onNameChange}
              singleClick
              value={this.props.name}/>
          <Button onClick={this._onNewClick}>New</Button>
          <Button onClick={this._onOpenClick}>Open</Button>
        </div>
        <div className="sv-header-content">
          <div className={statusClassName}>
            <span>{savedStatus}</span>
            <span>{lastSaved}</span>
          </div>
          <Button className="sv-header-content-save"
              onClick={this.props.onSaveClick}>
            <span>Save</span>
            <span dangerouslySetInnerHTML={{__html: `(${navigator.userAgent.indexOf('Mac OS X') !== -1 ? '&#8984;' : 'Ctrl'} + S)`}}/>
          </Button>
          <Button onClick={this.props.onPublishClick}>Publish</Button>
        </div>
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    changedAt: state.changedAt.present,
    name: state.name.present,
    updatedAt: state.updatedAt
  };
})(Header);
