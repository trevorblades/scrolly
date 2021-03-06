import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {findDOMNode} from 'react-dom';
import {connect} from 'react-redux';

import ViewportLayer from './viewport-layer';

import {
  addImageLayer,
  addShapeLayer,
  setLayerProperties,
  selectLayer
} from '../actions';
import {ASSET_DRAG_TYPE, SHAPE_DRAG_TYPE} from '../constants';
import getParents from '../util/get-parents';
import getInterpolatedValue from '../util/get-interpolated-value';
import isDragTypeFound from '../util/is-drag-type-found';
import layerPropType from '../util/layer-prop-type';

const ConnectedViewportLayer = connect(state => ({
  assets: state.assets.present
}))(ViewportLayer);

function propsToDimensions(props) {
  const compositionAspectRatio =
    props.compositionWidth / props.compositionHeight;
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
    height,
    offsetLeft,
    offsetTop,
    width
  };
}

const Viewport = React.createClass({
  propTypes: {
    assets: PropTypes.array.isRequired,
    className: PropTypes.string,
    compositionHeight: PropTypes.number.isRequired,
    compositionWidth: PropTypes.number.isRequired,
    dispatch: PropTypes.func,
    layers: PropTypes.arrayOf(layerPropType).isRequired,
    percentPlayed: PropTypes.number.isRequired,
    readOnly: PropTypes.bool,
    selectedLayer: PropTypes.number,
    wrapperHeight: PropTypes.number.isRequired,
    wrapperOffsetLeft: PropTypes.number.isRequired,
    wrapperOffsetTop: PropTypes.number.isRequired,
    wrapperWidth: PropTypes.number.isRequired
  },

  getDefaultProps() {
    return {
      wrapperOffsetLeft: 0,
      wrapperOffsetTop: 0
    };
  },

  getInitialState() {
    const initialState = propsToDimensions(this.props);
    initialState.selectedLayer = null;
    return initialState;
  },

  componentWillMount() {
    this.dragCounter = 0;
  },

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.compositionHeight !== this.props.compositionHeight ||
      nextProps.compositionWidth !== this.props.compositionWidth ||
      nextProps.wrapperHeight !== this.props.wrapperHeight ||
      nextProps.wrapperOffsetLeft !== this.props.wrapperOffsetLeft ||
      nextProps.wrapperOffsetTop !== this.props.wrapperOffsetTop ||
      nextProps.wrapperWidth !== this.props.wrapperWidth
    ) {
      this.setState(propsToDimensions(nextProps));
    } else if (
      nextProps.layers !== this.props.layers ||
      nextProps.selectedLayer !== this.props.selectedLayer
    ) {
      let selectedLayer;
      if (nextProps.selectedLayer !== null) {
        selectedLayer = nextProps.layers.find(
          layer => layer.id === nextProps.selectedLayer
        );
      }
      this.setState({selectedLayer: selectedLayer || null});
    }
  },

  onMouseDown() {
    if (this.props.selectedLayer !== null) {
      this.props.dispatch(selectLayer(null));
    }
  },

  onDragEnter(event) {
    event.preventDefault();
    if (isDragTypeFound(event, ASSET_DRAG_TYPE, SHAPE_DRAG_TYPE)) {
      this.dragCounter += 1;
      this.setState({dragging: true});
    }
  },

  onDragLeave(event) {
    if (isDragTypeFound(event, ASSET_DRAG_TYPE, SHAPE_DRAG_TYPE)) {
      this.dragCounter -= 1;
      if (!this.dragCounter) {
        this.setState({dragging: false});
      }
    }
  },

  onDragOver(event) {
    event.preventDefault();
  },

  onDrop(event) {
    event.preventDefault();
    const asset = event.dataTransfer.getData(ASSET_DRAG_TYPE);
    const shape = event.dataTransfer.getData(SHAPE_DRAG_TYPE);
    if (asset || shape) {
      if (asset) {
        const found = this.props.assets.find(
          ({id}) => id === parseInt(asset, 10)
        );
        if (found) {
          this.props.dispatch(addImageLayer(found));
        }
      } else {
        this.props.dispatch(addShapeLayer(shape));
      }
      this.dragCounter = 0;
      this.setState({dragging: false});
    }
  },

  renderLayer(layer) {
    const hidden =
      !layer.visible ||
      layer.in > this.props.percentPlayed ||
      layer.out < this.props.percentPlayed;
    const component = this.props.readOnly
      ? ViewportLayer
      : ConnectedViewportLayer;
    return React.createElement(component, {
      assets: this.props.assets,
      getInterpolatedValue: value =>
        getInterpolatedValue(value, this.props.percentPlayed),
      hidden,
      key: layer.id,
      layer,
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

  render() {
    const viewportClassName = classNames('sv-viewport', this.props.className, {
      'sv-dragging': this.state.dragging
    });
    return (
      <div
        className={viewportClassName}
        onDragEnter={this.onDragEnter}
        onDragLeave={this.onDragLeave}
        onDragOver={this.onDragOver}
        onDrop={this.onDrop}
        onMouseDown={this.onMouseDown}
        style={{
          width: this.state.width,
          height: this.state.height
        }}
      >
        {this.state.selectedLayer && this.renderLayer(this.state.selectedLayer)}
        <div className="sv-viewport-layers">
          {this.props.layers.map(this.renderLayer)}
        </div>
      </div>
    );
  },

  getScale() {
    return this.state.width / this.props.compositionWidth;
  },

  getLayerDimensions(id) {
    const layer = findDOMNode(this.refs[`layer${id}`]);
    const scale = this.getScale();
    return {
      width: layer.offsetWidth / scale,
      height: layer.offsetHeight / scale
    };
  }
});

export default Viewport;
