const React = require('react');
const {connect} = require('react-redux');

const ShareDialog = React.createClass({

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
      <div className="sv-share-dialog">
        <div className="sv-share-dialog-overlay"
            onClick={this.props.onClose}/>
        <div className="sv-share-dialog-window">
          <textarea onClick={this._onTextareaClick}
              readOnly
              value={`<iframe src="https://scrol.ly/viewer/?p=${this.props.slug}"></iframe>`}/>
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
})(ShareDialog);
