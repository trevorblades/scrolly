const React = require('react');
const {connect} = require('react-redux');
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
    let status;
    if (this.props.updatedAt) {
      status = (
        <div className="sv-header-content-status">
          {this.props.changedAt && <div>
            {this.props.updatedAt.getTime() === this.props.changedAt.getTime() ?
                'Saved' : 'Unsaved changes'}
          </div>}
          <div>{`Last saved at ${moment().calendar(this.props.updatedAt)}`}</div>
        </div>
      );
    }
    return (
      <div className="sv-header">
        <div className="sv-header-content">
          {status}
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
