const React = require('react');
const {connect} = require('react-redux');

const PublishDialog = React.createClass({

  propTypes: {
    onClose: React.PropTypes.func.isRequired,
    slug: React.PropTypes.string.isRequired
  },

  _onTextareaClick: function(event) {
    event.target.focus();
    event.target.select();
  },

  render: function() {
    return (
      <div className="sv-publish-dialog">
        <div className="sv-publish-dialog-overlay"
            onClick={this.props.onClose}/>
        <div className="sv-publish-dialog-window">
          <textarea onClick={this._onTextareaClick}
              readOnly
              value={`<iframe src="https://scrol.ly/viewer/?project=${this.props.slug}"></iframe>`}/>
        </div>
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    layers: state.layers.present,
    step: state.step.present
  };
})(PublishDialog);
