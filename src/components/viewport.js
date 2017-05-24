const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const classNames = require('classnames');

const ViewportLayer = require('./viewport-layer');

const {addImageLayer, setLayerProperties, selectLayer} = require('../actions');
const {ASSET_DRAG_TYPE, PRESET_DRAG_TYPE} = require('../constants');
const getParents = require('../util/get-parents');
const getInterpolatedValue = require('../util/get-interpolated-value');
const isDragTypeFound = require('../util/is-drag-type-found');
const layerPropType = require('../util/layer-prop-type');

const ConnectedViewportLayer = connect(function(state) {
  return {
    assets: state.assets.present
  };
})(ViewportLayer);

function propsToDimensions(props) {
  const compositionAspectRatio = props.compositionWidth / props.compositionHeight;
  const outerAspectRatio = props.wrapperWidth / props.wrapperHeight;

  let height = props.wrapperHeight;
  let width = props.wrapperWidth;
  if (compositionAspectRatio > outerAspectRatio) {
    height = props.wrapperWidth / compositionAspectRatio;
  } else {
    width = props.wrapperHeight * compositionAspectRatio;
  }

  const offsetLeft = props.wrapperOffsetLeft + (props.wrapperWidth - width) / 2;
  const offsetTop = props.wrapperOffsetTop + (props.wrapperHeight - height) / 2;
  return {
    height: height,
    offsetLeft: offsetLeft,
    offsetTop: offsetTop,
    width: width
  };
}

const Viewport = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired,
    compositionHeight: React.PropTypes.number.isRequired,
    compositionWidth: React.PropTypes.number.isRequired,
    dispatch: React.PropTypes.func,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    readOnly: React.PropTypes.bool,
    selectedLayer: React.PropTypes.number,
    wrapperHeight: React.PropTypes.number.isRequired,
    wrapperOffsetLeft: React.PropTypes.number.isRequired,
    wrapperOffsetTop: React.PropTypes.number.isRequired,
    wrapperWidth: React.PropTypes.number.isRequired
  },

  getDefaultProps: function() {
    return {
      wrapperOffsetLeft: 0,
      wrapperOffsetTop: 0
    };
  },

  getInitialState: function() {
    const initialState = propsToDimensions(this.props);
    initialState.selectedLayer = null;
    return initialState;
  },

  componentWillMount: function() {
    this._dragCounter = 0;
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.compositionHeight !== this.props.compositionHeight ||
        nextProps.compositionWidth !== this.props.compositionWidth ||
        nextProps.wrapperHeight !== this.props.wrapperHeight ||
        nextProps.wrapperOffsetLeft !== this.props.wrapperOffsetLeft ||
        nextProps.wrapperOffsetTop !== this.props.wrapperOffsetTop ||
        nextProps.wrapperWidth !== this.props.wrapperWidth) {
      this.setState(propsToDimensions(nextProps));
    } else if (nextProps.layers !== this.props.layers ||
        nextProps.selectedLayer !== this.props.selectedLayer) {
      let selectedLayer;
      if (nextProps.selectedLayer !== null) {
        selectedLayer = nextProps.layers.find(layer => layer.id === nextProps.selectedLayer);
      }
      this.setState({selectedLayer: selectedLayer || null});
    }
  },

  _onMouseDown: function() {
    if (this.props.selectedLayer !== null) {
      this.props.dispatch(selectLayer(null));
    }
  },

  _onDragEnter: function(event) {
    event.preventDefault();
    if (isDragTypeFound(event, ASSET_DRAG_TYPE, PRESET_DRAG_TYPE)) {
      this._dragCounter++;
      this.setState({dragging: true});
    }
  },

  _onDragLeave: function(event) {
    if (isDragTypeFound(event, ASSET_DRAG_TYPE, PRESET_DRAG_TYPE)) {
      this._dragCounter--;
      if (!this._dragCounter) {
        this.setState({dragging: false});
      }
    }
  },

  _onDragOver: function(event) {
    event.preventDefault();
  },

  _onDrop: function(event) {
    event.preventDefault();
    const asset = event.dataTransfer.getData(ASSET_DRAG_TYPE);
    const preset = event.dataTransfer.getData(PRESET_DRAG_TYPE);
    if (asset || preset) {
      if (asset) {
        const found = this.props.assets.find(({id}) => id === parseInt(asset));
        if (found) {
          this.props.dispatch(addImageLayer(found));
        }
      } else {
        // handle preset
      }
      this._dragCounter = 0;
      this.setState({dragging: false});
    }
  },

  _renderLayer: function(layer) {
    const hidden = !layer.visible ||
        layer.in > this.props.percentPlayed ||
        layer.out < this.props.percentPlayed;
    const component = this.props.readOnly ?
        ViewportLayer : ConnectedViewportLayer;
    return React.createElement(component, {
      assets: this.props.assets,
      getInterpolatedValue: value => {
        return getInterpolatedValue(value, this.props.percentPlayed);
      },
      hidden: hidden,
      key: layer.id,
      layer: layer,
      layers: this.props.layers,
      onPropertiesChange: properties => {
        this.props.dispatch(setLayerProperties(layer.id, properties));
      },
      parents: getParents(layer, this.props.layers),
      percentPlayed: this.props.percentPlayed,
      readOnly: this.props.readOnly,
      ref: `layer${layer.id}`,
      selected: layer.id === this.props.selectedLayer,
      viewportHeight: this.state.height,
      viewportOffsetLeft: this.state.offsetLeft,
      viewportOffsetTop: this.state.offsetTop,
      viewportScale: this.getScale(),
      viewportWidth: this.state.width
    });
  },

  render: function() {
    const viewportClassName = classNames('sv-viewport', {
      'sv-dragging': this.state.dragging
    });
    return (
      <div className={viewportClassName}
          onDragEnter={this._onDragEnter}
          onDragLeave={this._onDragLeave}
          onDragOver={this._onDragOver}
          onDrop={this._onDrop}
          onMouseDown={this._onMouseDown}
          style={{
            width: this.state.width,
            height: this.state.height
          }}>
        {this.state.selectedLayer && this._renderLayer(this.state.selectedLayer)}
        <div className="sv-viewport-layers">
          {this.props.layers.map(this._renderLayer)}
        </div>
      </div>
    );
  },

  getScale: function() {
    return this.state.width / this.props.compositionWidth;
  },

  getLayerDimensions: function(id) {
    const layer = ReactDOM.findDOMNode(this.refs[`layer${id}`]);
    const scale = this.getScale();
    return {
      width: layer.offsetWidth / scale,
      height: layer.offsetHeight / scale
    };
  }
});

module.exports = Viewport;
