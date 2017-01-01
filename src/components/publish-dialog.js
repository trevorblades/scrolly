const React = require('react');
const {connect} = require('react-redux');

const layerPropType = require('../util/layer-prop-type');

const PublishDialog = React.createClass({

  propTypes: {
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    onClose: React.PropTypes.func.isRequired,
    step: React.PropTypes.number.isRequired
  },

  _onTextareaClick: function(event) {
    event.target.focus();
    event.target.select();
  },

  render: function() {
    const scripts = `<div id="sv-player"></div>
    <script type="text/javascript">
      var layers = ${JSON.stringify(this.props.layers)};
      var step = ${this.props.step};
    </script>`;
    return (
      <div className="sv-publish-dialog">
        <div className="sv-publish-dialog-overlay"
            onClick={this.props.onClose}/>
        <div className="sv-publish-dialog-window">
          <textarea onClick={this._onTextareaClick} readOnly value={scripts}/>
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
