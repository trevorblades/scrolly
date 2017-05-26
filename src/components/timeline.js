import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import upperCaseFirst from 'upper-case-first';

import Button from './button';
import Control from './control';
import Icon from './icon';
import TextField from './text-field';
import TimelineLayer from './timeline-layer';

import {
  addLayer,
  linkLayers,
  orderLayers,
  setPercentPlayed,
  selectLayer
} from '../actions';
import getInterpolatedValue from '../util/get-interpolated-value';
import getParentProperties from '../util/get-parent-properties';
import getParents from '../util/get-parents';
import isInput from '../util/is-input';
import layerPropType from '../util/layer-prop-type';
import shouldSnap from '../util/should-snap';

const MIN_HEIGHT = 200;

const numTicks = 17;
const ticks = [];
for (let i = 0; i < numTicks; i += 1) {
  ticks.push({});
}

const Timeline = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    getInterpolatedValue: React.PropTypes.func.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    onResize: React.PropTypes.func.isRequired,
    onStepChange: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selectedLayer: React.PropTypes.number,
    selectLayer: React.PropTypes.func.isRequired,
    setPercentPlayed: React.PropTypes.func.isRequired,
    step: React.PropTypes.number.isRequired
  },

  getInitialState() {
    return {
      adding: false,
      height: 200,
      linkingLayerId: null,
      scrolling: false,
      snapToKeyframes: true,
      sortId: null,
      sortOrder: null,
      stickyLayerId: null,
      stuckLayerId: null
    };
  },

  componentWillMount() {
    window.addEventListener('keydown', this.onKeyDown);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  },

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.maxHeight !== this.props.maxHeight &&
      this.state.height > nextProps.maxHeight
    ) {
      let height = nextProps.maxHeight;
      if (height < MIN_HEIGHT) {
        height = MIN_HEIGHT;
      }
      this.setState({height});
    }
  },

  onKeyDown(event) {
    if (event.keyCode === 75 && !isInput(event.target)) {
      // k key pressed
      this.setState({snapToKeyframes: !this.state.snapToKeyframes});
    } else if (
      (event.keyCode === 188 || event.keyCode === 190) &&
      !isInput(event.target)
    ) {
      // < or > key pressed
      event.preventDefault();
      let movement = event.keyCode === 188 ? -1 : 1;
      movement /= event.shiftKey ? 10 : 100;
      this.props.setPercentPlayed(this.props.percentPlayed + movement);
    }
  },

  onLayersScroll(event) {
    let stickyLayerId = null;
    let stuckLayerId = null;
    const scrollPos = event.currentTarget.scrollTop;
    const layers = event.currentTarget.childNodes;
    for (let i = layers.length - 1; i >= 0; i -= 1) {
      const layer = layers[i];
      if (layer.childNodes.length > 1 && layer.offsetTop <= scrollPos) {
        const nextLayer = layers[i + 1];
        const marginTop = parseInt(getComputedStyle(layer).marginTop, 10);
        const layerTopHeight =
          layer.childNodes[0].offsetHeight + marginTop + scrollPos;
        if (nextLayer && nextLayer.offsetTop <= layerTopHeight) {
          stuckLayerId = this.props.layers[i].id;
        } else {
          stickyLayerId = this.props.layers[i].id;
        }
        break;
      }
    }
    this.setState({
      stickyLayerId,
      stuckLayerId
    });
  },

  onLayersWheel() {
    if (this.wheelTimeout) {
      this.onLayersWheelEnd(true);
    }
    this.wheelTimeout = setTimeout(this.onLayersWheelEnd, 100);
    if (!this.state.scrolling) {
      this.setState({scrolling: true});
    }
  },

  onLayersWheelEnd(reset) {
    if (!reset) {
      this.setState({scrolling: false});
    }
    clearTimeout(this.wheelTimeout);
    delete this.wheelTimeout;
  },

  onLayerDragEnd() {
    const sortOrder = this.state.sortOrder.slice();
    sortOrder.reverse();
    this.props.dispatch(orderLayers(sortOrder));
    this.setState({
      sortId: null,
      sortOrder: null
    });
  },

  onLayerDragOver(event) {
    const layer = event.currentTarget;
    const layerIndex = this.state.sortOrder.indexOf(this.state.sortId);
    const targetIndex = Array.from(layer.parentNode.children).indexOf(layer);
    const sortOrder = this.state.sortOrder.slice();
    sortOrder.splice(layerIndex, 1);
    sortOrder.splice(targetIndex, 0, this.state.sortId);

    let changed = false;
    for (let i = sortOrder.length - 1; i >= 0; i -= 1) {
      if (sortOrder[i] !== this.state.sortOrder[i]) {
        changed = true;
        break;
      }
    }

    if (changed) {
      this.setState({sortOrder});
    }
  },

  onLayerDragStart(event, id) {
    const dataTransfer = event.dataTransfer;
    dataTransfer.effectAllowed = 'none';
    this.props.selectLayer(id);
    this.setState({
      sortId: id,
      sortOrder: this.props.layers.map(layer => layer.id)
    });
  },

  onLayerLinkClick(event, id) {
    event.stopPropagation();
    this.setState({
      linkingLayerId: this.state.linkingLayerId === null ? id : null
    });
  },

  onLayerLinkTargetClick(event, layer) {
    event.stopPropagation();

    let offsetX = this.props.getInterpolatedValue(layer.x);
    let offsetY = this.props.getInterpolatedValue(layer.y);
    let offsetScale = this.props.getInterpolatedValue(layer.scale);
    if (layer.parent) {
      const parents = getParents(layer, this.props.layers);
      const parent = getParentProperties(parents, this.props.percentPlayed);
      const parentScale = parent.scale / layer.parent.offsetScale;
      offsetX = parent.x + (offsetX - layer.parent.offsetX) * parentScale;
      offsetY = parent.y + (offsetY - layer.parent.offsetY) * parentScale;
      offsetScale *= parentScale;
    }

    this.props.dispatch(
      linkLayers(this.state.linkingLayerId, {
        id: layer.id,
        offsetX,
        offsetY,
        offsetScale
      })
    );
    this.setState({linkingLayerId: null});
  },

  onHandleMouseDown(event) {
    if (event.button === 0) {
      document.addEventListener('mousemove', this.onHandleMouseMove);
      document.addEventListener('mouseup', this.onHandleMouseUp);
    }
  },

  onHandleMouseMove(event) {
    let height = window.innerHeight - event.clientY;
    if (height > this.props.maxHeight) {
      height = this.props.maxHeight;
    }
    if (height < MIN_HEIGHT) {
      height = MIN_HEIGHT;
    }
    this.setState({height}, this.props.onResize);
  },

  onHandleMouseUp() {
    document.removeEventListener('mousemove', this.onHandleMouseMove);
    document.removeEventListener('mouseup', this.onHandleMouseUp);
  },

  onHeaderTrackWheel(event) {
    const movementY = event.deltaY / this.props.step;
    const percentPlayed =
      (this.track.offsetWidth * this.props.percentPlayed + movementY) /
      this.track.offsetWidth;
    this.props.setPercentPlayed(percentPlayed);
  },

  onHeaderTrackMouseDown(event) {
    if (event.button === 0) {
      const percentPlayed =
        (event.clientX - this.track.offsetLeft) / this.track.offsetWidth;
      this.props.setPercentPlayed(percentPlayed);
      this.onPlayheadMouseDown(event);
    }
  },

  onPlayheadMouseDown(event) {
    if (event.button === 0) {
      document.addEventListener('mousemove', this.onPlayheadMouseMove);
      document.addEventListener('mouseup', this.onPlayheadMouseUp);
    }
  },

  onPlayheadMouseMove(event) {
    let percentPlayed =
      (event.clientX - this.track.offsetLeft) / this.track.offsetWidth;

    if (event.shiftKey) {
      if (this.state.snapToKeyframes) {
        const snapPositions = Object.keys(
          this.props.layers.reduce((obj, layer) => {
            const nextObj = {...obj};
            Object.keys(layer).forEach(property => {
              const value = layer[property];
              if (
                (property === 'in' || property === 'out') &&
                shouldSnap(value, percentPlayed)
              ) {
                nextObj[value] = true;
              } else if (typeof value === 'object') {
                Object.keys(value).forEach(key => {
                  if (shouldSnap(key, percentPlayed)) {
                    nextObj[key] = true;
                  }
                });
              }
            });
            return obj;
          }, {})
        )
          .map(Number)
          .sort();

        if (snapPositions.length) {
          percentPlayed = snapPositions.reduce(
            (a, b) =>
              Math.abs(b - percentPlayed) < Math.abs(a - percentPlayed) ? b : a
          );
        }
      } else {
        percentPlayed = Math.round(percentPlayed * 100) / 100;
      }
    }

    this.props.setPercentPlayed(percentPlayed);
  },

  onPlayheadMouseUp() {
    document.removeEventListener('mousemove', this.onPlayheadMouseMove);
    document.removeEventListener('mouseup', this.onPlayheadMouseUp);
  },

  onSnapToggle() {
    this.setState({snapToKeyframes: !this.state.snapToKeyframes});
  },

  onAddToggle() {
    this.setState({adding: !this.state.adding});
  },

  onAddLayerClick(type) {
    this.props.dispatch(addLayer(type));
    this.setState({adding: false});
  },

  deselectLayer() {
    this.props.selectLayer(null);
  },

  render() {
    const percentPlayed = this.props.percentPlayed * 100;
    const marker = (
      <div className="sv-timeline-marker" style={{left: `${percentPlayed}%`}} />
    );

    const layers = this.state.sortOrder
      ? this.state.sortOrder.map(id =>
          this.props.layers.find(layer => layer.id === id)
        )
      : this.props.layers;

    const layersClassName = classNames('sv-timeline-layers', {
      'sv-scrolling': this.state.scrolling
    });

    const menuActions = [
      {
        id: 'scroll',
        content: (
          <div className="sv-timeline-header-menu-step">
            <TextField
              onChange={this.props.onStepChange}
              type="number"
              value={this.props.step}
            />
            <Icon name="scroll" />
          </div>
        ),
        title: 'Step amount (pixels scrolled for every percent played)'
      },
      {
        id: 'snap',
        content: (
          <Icon
            name={this.state.snapToKeyframes ? 'keyframes' : 'wholeNumbers'}
          />
        ),
        onClick: this.onSnapToggle,
        title: `Snapping to ${this.state.snapToKeyframes ? 'keyframes' : 'whole numbers'} (K)`
      }
    ];

    const addClassName = classNames('sv-timeline-header-menu-add', {
      'pl-active': this.state.adding
    });

    return (
      <div className="sv-timeline" style={{height: this.state.height}}>
        <div className="sv-timeline-header">
          <div className="sv-timeline-header-menu">
            <Control actions={menuActions}>
              {`${percentPlayed.toFixed(2)}%`}
            </Control>
            <Button
              className={addClassName}
              onClick={this.onAddToggle}
              title="Add a layer"
            >
              <Icon name={this.state.adding ? 'close' : 'add'} />
            </Button>
          </div>
          <div
            className="sv-timeline-header-track"
            onMouseDown={this.onHeaderTrackMouseDown}
            onWheel={this.onHeaderTrackWheel}
          >
            <div className="sv-timeline-header-track-ticks">
              {ticks.map((tick, index) => (
                <div
                  key={index.toString()}
                  className="sv-timeline-header-track-tick"
                />
              ))}
            </div>
            {marker}
            <div
              className="sv-timeline-header-track-playhead"
              onMouseDown={this.onPlayheadMouseDown}
              style={{left: `${percentPlayed}%`}}
            />
          </div>
        </div>
        <div className="sv-timeline-content" onMouseDown={this.deselectLayer}>
          <div
            className={layersClassName}
            onScroll={this.onLayersScroll}
            onWheel={this.onLayersWheel}
          >
            {layers.map(layer => {
              const parents = getParents(layer, this.props.layers);
              const parentIds = parents.map(parent => parent.id);
              return (
                <TimelineLayer
                  key={layer.id}
                  layer={layer}
                  layers={this.props.layers}
                  linkable={
                    this.state.linkingLayerId !== null &&
                      layer.id !== this.state.linkingLayerId
                  }
                  onDragEnd={this.onLayerDragEnd}
                  onDragOver={this.onLayerDragOver}
                  onDragStart={event => this.onLayerDragStart(event, layer.id)}
                  onLinkClick={event => this.onLayerLinkClick(event, layer.id)}
                  onLinkTargetClick={event =>
                    this.onLayerLinkTargetClick(event, layer)}
                  parent={
                    layer.parent &&
                      this.props.layers.find(l => l.id === layer.parent.id)
                  }
                  percentPlayed={this.props.percentPlayed}
                  selected={layer.id === this.props.selectedLayer}
                  sticky={layer.id === this.state.stickyLayerId}
                  stuck={layer.id === this.state.stuckLayerId}
                  unlinkable={
                    parentIds.indexOf(this.state.linkingLayerId) !== -1
                  }
                />
              );
            })}
          </div>
          {this.state.adding &&
            <div className="sv-timeline-layer-options">
              {['dummy', 'text'].map((type, index) => {
                const title = `Add ${type} layer`;
                return (
                  <div
                    key={index.toString()}
                    className="sv-timeline-layer-option"
                    onClick={() => this.onAddLayerClick(type)}
                    title={title}
                  >
                    <Icon name={`add${upperCaseFirst(type)}Layer`} />
                    <span>{title}</span>
                  </div>
                );
              })}
            </div>}
          <div
            ref={node => {
              this.track = node;
            }}
            className="sv-timeline-track"
          >
            {marker}
          </div>
        </div>
        <div
          className="sv-timeline-handle"
          onMouseDown={this.onHandleMouseDown}
        />
      </div>
    );
  }
});

function mapStateToProps(state) {
  const layers = state.layers.present.slice();
  layers.reverse();
  return {
    getInterpolatedValue(value) {
      return getInterpolatedValue(value, state.percentPlayed);
    },
    layers,
    percentPlayed: state.percentPlayed,
    selectedLayer: state.selectedLayer,
    step: state.step.present
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onStepChange(value) {
      dispatch({type: 'SET_STEP', value: value < 1 ? 1 : value});
    },
    setPercentPlayed(value) {
      dispatch(setPercentPlayed(value));
    },
    selectLayer(id) {
      dispatch(selectLayer(id));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
