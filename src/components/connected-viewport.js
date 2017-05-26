import {connect} from 'react-redux';
import Viewport from './viewport';

export default connect(
  state => ({
    assets: state.assets.present,
    layers: state.layers.present,
    percentPlayed: state.percentPlayed,
    selectedLayer: state.selectedLayer
  }),
  null,
  null,
  {withRef: true}
)(Viewport);
