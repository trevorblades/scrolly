const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');

const Button = require('./button');

const formatDate = require('../util/format-date');

const Header = React.createClass({

  propTypes: {
    changedAt: React.PropTypes.string,
    dispatch: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
    onNewClick: React.PropTypes.func.isRequired,
    onOpenClick: React.PropTypes.func.isRequired,
    onSaveClick: React.PropTypes.func.isRequired,
    onShareClick: React.PropTypes.func.isRequired,
    saving: React.PropTypes.bool.isRequired,
    updatedAt: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      name: this.props.name
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.name !== this.props.name) {
      this.setState({name: nextProps.name});
    }
  },

  _onNameBlur: function() {
    if (this.state.name !== this.props.name) {
      this.props.dispatch({
        type: 'SET_NAME',
        value: this.state.name
      });
    }
  },

  _onNameChange: function(event) {
    this.setState({name: event.target.value});
  },

  _onNameKeyDown: function(event) {
    if (event.keyCode === 27) { // esc key pressed
      event.target.blur();
    }
  },

  render: function() {
    let changed = !!this.props.changedAt;
    let lastSaved = 'Save your project to publish it';
    let savedStatus = !this.props.changedAt ? 'Nothing to save' : 'Not saved';
    if (this.props.updatedAt) {
      const updatedAt = new Date(this.props.updatedAt);
      lastSaved = `Last saved ${formatDate(updatedAt)}`;
      if (this.props.changedAt) {
        changed = new Date(this.props.changedAt).getTime() !== updatedAt.getTime();
        savedStatus = changed ? 'Unsaved changes' : 'Saved';
      }
    }

    const statusClassName = classNames('sv-header-project-controls-status',
        `sv-${savedStatus.split(' ').join('-').toLowerCase()}`);

    return (
      <div className="sv-header">
        <img className="sv-header-logo" src="/assets/logo.svg"/>
        <div className="sv-header-nav">
          <Button onClick={this.props.onNewClick}>New</Button>
          <Button onClick={this.props.onOpenClick}>Open</Button>
        </div>
        <div className="sv-header-project">
          <input onBlur={this._onNameBlur}
              onChange={this._onNameChange}
              onKeyDown={this._onNameKeyDown}
              type="text"
              value={this.state.name}/>
          <div className="sv-header-project-controls">
            <div className={statusClassName}>
              <span>{this.props.saving ? 'Saving project...' : savedStatus}</span>
              <span>{lastSaved}</span>
            </div>
            <Button className="sv-header-project-controls-save"
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
