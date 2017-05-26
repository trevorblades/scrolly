import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';

import Button from './button';

import formatDate from '../util/format-date';

const Header = React.createClass({
  propTypes: {
    changedAt: React.PropTypes.string,
    dispatch: React.PropTypes.func.isRequired,
    name: React.PropTypes.string.isRequired,
    onEditClick: React.PropTypes.func.isRequired,
    onLogOutClick: React.PropTypes.func.isRequired,
    onNewClick: React.PropTypes.func.isRequired,
    onOpenClick: React.PropTypes.func.isRequired,
    onSaveClick: React.PropTypes.func.isRequired,
    onShareClick: React.PropTypes.func.isRequired,
    saving: React.PropTypes.bool.isRequired,
    updatedAt: React.PropTypes.string
  },

  render() {
    let changed = !!this.props.changedAt;
    let lastSaved = 'Save your project to share it';
    let savedStatus = !this.props.changedAt ? 'Nothing to save' : 'Not saved';
    if (this.props.updatedAt) {
      const updatedAt = new Date(this.props.updatedAt);
      lastSaved = `Last saved ${formatDate(updatedAt)}`;
      if (this.props.changedAt) {
        changed =
          new Date(this.props.changedAt).getTime() !== updatedAt.getTime();
        savedStatus = changed ? 'Unsaved changes' : 'Saved';
      }
    }

    const statusClassName = classNames(
      'sv-header-controls-status',
      `sv-${savedStatus.split(' ').join('-').toLowerCase()}`
    );

    const navs = {
      file: {
        New: this.props.onNewClick,
        Edit: this.props.onEditClick,
        Open: this.props.onOpenClick
      },
      user: {
        'Log out': this.props.onLogOutClick
      }
    };

    return (
      <div className="sv-header">
        <img
          alt="Scrolly logo"
          className="sv-header-logo"
          src="/assets/logo.svg"
        />
        <div className="sv-header-navs">
          {Object.keys(navs).map(nav => (
            <div key={nav} className="sv-header-nav">
              {Object.keys(navs[nav]).map(key => (
                <Button key={key} onClick={nav[key]}>{key}</Button>
              ))}
            </div>
          ))}
        </div>
        <div
          className={classNames('sv-header-name', {'sv-changed': changed})}
          onClick={this.props.onEditClick}
        >
          {this.props.name}
        </div>
        <div className="sv-header-controls">
          <div className={statusClassName}>
            <span>{this.props.saving ? 'Saving project...' : savedStatus}</span>
            <span>{lastSaved}</span>
          </div>
          <Button
            className="sv-header-controls-save"
            disabled={!changed || this.props.saving}
            onClick={this.props.onSaveClick}
          >
            <span>Save</span>
            <span>
              {`(${navigator.userAgent.indexOf('Mac OS X') !== -1 ? '⌘' : 'Ctrl'} + S)`}
            </span>
          </Button>
          <Button
            disabled={!this.props.updatedAt}
            onClick={this.props.onShareClick}
          >
            Share
          </Button>
        </div>
      </div>
    );
  }
});

export default connect(
  state => ({
    changedAt: state.changedAt.present,
    name: state.name.present,
    updatedAt: state.updatedAt
  }),
  null,
  null,
  {
    withRef: true
  }
)(Header);
