const {connect} = require('react-redux');
const Viewport = require('./viewport');

module.exports = connect(function(state) {
  return {
    assets: state.assets.present,
    layers: state.layers.present,
    percentPlayed: state.percentPlayed,
    selectedLayer: state.selectedLayer
  };
}, null, null, {withRef: true})(Viewport);
