const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');

const Button = require('./button');
const Icon = require('./icon');
const TimelineLayer = require('./timeline-layer');

const {addLayer, linkLayers, orderLayers} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const isInput = require('../util/is-input');
const layerPropType = require('../util/layer-prop-type');

const MIN_HEIGHT = 100;
const SNAP_TOLERANCE = 0.01;

let numTicks = 17;
const ticks = [];
for (var i = 0; i < numTicks; i++) {
  ticks.push({});
}

function shouldSnap(keyframe, percentPlayed) {
  return Math.abs(keyframe - percentPlayed) <= SNAP_TOLERANCE;
}

let Timeline = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    onAddClick: React.PropTypes.func.isRequired,
    onResize: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selectLayer: React.PropTypes.func.isRequired,
    selectedLayerId: React.PropTypes.number,
    setPercentPlayed: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
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

  componentWillMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.maxHeight !== this.props.maxHeight &&
          this.state.height > nextProps.maxHeight) {
      let height = nextProps.maxHeight;
      if (height < MIN_HEIGHT) {
        height = MIN_HEIGHT;
      }
      this.setState({height: height});
    }
  },

  _onKeyDown: function(event) {
    if (event.keyCode === 75 && !isInput(event.target)) { // k key pressed
      this.setState({snapToKeyframes: !this.state.snapToKeyframes});
    }
  },

  _onLayersScroll: function(event) {
    let stickyLayerId = null;
    let stuckLayerId = null;
    const scrollPos = event.currentTarget.scrollTop;
    const layers = event.currentTarget.childNodes;
    for (var i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (layer.childNodes.length > 1 &&
          layer.offsetTop <= scrollPos) {
        const nextLayer = layers[i + 1];
        const marginTop = parseInt(getComputedStyle(layer).marginTop);
        const layerTopHeight = layer.childNodes[0].offsetHeight + marginTop + scrollPos;
        if (nextLayer && nextLayer.offsetTop <= layerTopHeight) {
          stuckLayerId = this.props.layers[i].id;
        } else {
          stickyLayerId = this.props.layers[i].id;
        }
        break;
      }
    }
    this.setState({
      stickyLayerId: stickyLayerId,
      stuckLayerId: stuckLayerId
    });
  },

  _onLayersWheel: function(event) {
    if (this._wheelTimeout) {
      this._onLayersWheelEnd(true);
    }
    this._wheelTimeout = setTimeout(this._onLayersWheelEnd, 100);
    if (!this.state.scrolling) {
      this.setState({scrolling: true});
    }
  },

  _onLayersWheelEnd: function(reset) {
    if (!reset) {
      this.setState({scrolling: false});
    }
    clearTimeout(this._wheelTimeout);
    delete this._wheelTimeout;
  },

  _onLayerDragEnd: function() {
    this.props.dispatch(orderLayers(this.state.sortOrder));
    this.setState({
      sortId: null,
      sortOrder: null
    });
  },

  _onLayerDragOver: function(event) {
    const layer = event.currentTarget;
    const layerIndex = this.state.sortOrder.indexOf(this.state.sortId);
    const targetIndex = Array.from(layer.parentNode.children).indexOf(layer);
    const sortOrder = this.state.sortOrder.slice();
    sortOrder.splice(layerIndex, 1);
    sortOrder.splice(targetIndex, 0, this.state.sortId);

    let changed = false;
    for (var i = sortOrder.length - 1; i >= 0; i--) {
      if (sortOrder[i] !== this.state.sortOrder[i]) {
        changed = true;
        break;
      }
    }

    if (changed) {
      this.setState({sortOrder: sortOrder});
    }
  },

  _onLayerDragStart: function(id, event) {
    event.dataTransfer.effectAllowed = 'none';
    this.props.selectLayer(id);
    this.setState({
      sortId: id,
      sortOrder: this.props.layers.map(layer => layer.id)
    });
  },

  _onLayerLinkClick: function(id, event) {
    event.stopPropagation();
    this.setState({linkingLayerId: this.state.linkingLayerId === null ? id : null});
  },

  _onLayerUnlinkClick: function(id, event) {
    event.stopPropagation();
    this.props.dispatch(linkLayers(id, null));
  },

  _onLayerLinkTargetClick: function(id, event) {
    event.stopPropagation();
    const parent = this.props.layers.find(layer => layer.id === id);
    this.props.dispatch(linkLayers(this.state.linkingLayerId, {
      id: parent.id,
      offsetX: getInterpolatedValue(parent.x, this.props.percentPlayed),
      offsetY: getInterpolatedValue(parent.y, this.props.percentPlayed),
      offsetScale: getInterpolatedValue(parent.scale, this.props.percentPlayed)
    }));
    this.setState({linkingLayerId: null});
  },

  _onLayerSelect: function(id, event) {
    event.stopPropagation();
    this.props.selectLayer(id);
  },

  _onHandleMouseDown: function(event) {
    if (event.button === 0) {
      document.addEventListener('mousemove', this._onHandleMouseMove);
      document.addEventListener('mouseup', this._onHandleMouseUp);
    }
  },

  _onHandleMouseMove: function(event) {
    let height = window.innerHeight - event.clientY;
    if (height > this.props.maxHeight) {
      height = this.props.maxHeight;
    }
    if (height < MIN_HEIGHT) {
      height = MIN_HEIGHT;
    }
    this.setState({height: height}, this.props.onResize);
  },

  _onHandleMouseUp: function() {
    document.removeEventListener('mousemove', this._onHandleMouseMove);
    document.removeEventListener('mouseup', this._onHandleMouseUp);
  },

  _onHeaderTrackWheel: function(event) {
    const percentPlayed = (this.refs.track.offsetWidth * this.props.percentPlayed + event.deltaY) / this.refs.track.offsetWidth;
    this.props.setPercentPlayed(percentPlayed);
  },

  _onHeaderTrackMouseDown: function(event) {
    if (event.button === 0) {
      const percentPlayed = (event.clientX - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
      this.props.setPercentPlayed(percentPlayed);
      this._onPlayheadMouseDown(event);
    }
  },

  _onPlayheadMouseDown: function(event) {
    if (event.button === 0) {
      document.addEventListener('mousemove', this._onPlayheadMouseMove);
      document.addEventListener('mouseup', this._onPlayheadMouseUp);
    }
  },

  _onPlayheadMouseMove: function(event) {
    let percentPlayed = (event.clientX - this.refs.track.offsetLeft) /
        this.refs.track.offsetWidth;

    if (event.shiftKey) {
      if (this.state.snapToKeyframes) {
        const snapPositions = Object.keys(this.props.layers.reduce(function(obj, layer) {
          for (var property in layer) {
            const value = layer[property];
            if ((property === 'in' || property === 'out') &&
                shouldSnap(value, percentPlayed)) {
              obj[value] = true;
            } else if (typeof value === 'object') {
              for (var key in value) {
                if (shouldSnap(key, percentPlayed)) {
                  obj[key] = true;
                }
              }
            }
          }
          return obj;
        }, {})).map(Number).sort();

        if (snapPositions.length) {
          percentPlayed = snapPositions.reduce(function(a, b) {
            return (Math.abs(b - percentPlayed) < Math.abs(a - percentPlayed) ? b : a);
          });
        }
      } else {
        percentPlayed = Math.round(percentPlayed * 100) / 100;
      }
    }

    this.props.setPercentPlayed(percentPlayed);
  },

  _onPlayheadMouseUp: function() {
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onSnapToggle: function() {
    this.setState({snapToKeyframes: !this.state.snapToKeyframes});
  },

  render: function() {
    const percentPlayed = this.props.percentPlayed * 100;
    const marker = (
      <div className="pl-timeline-marker"
          style={{left: `${percentPlayed}%`}}/>
    );

    const layers = this.state.sortOrder ?
        this.state.sortOrder.map(id => {
          return this.props.layers.find(layer => layer.id === id);
        }) : this.props.layers;

    const layersClassName = classNames('pl-timeline-layers', {
      'pl-scrolling': this.state.scrolling
    });

    return (
      <div className="pl-timeline" style={{height: this.state.height}}>
        <div className="pl-timeline-header">
          <div className="pl-timeline-header-control">
            <div className="pl-timeline-header-control-indicator">
              <span>{`${percentPlayed.toFixed(2)}%`}</span>
              <div className="pl-timeline-header-control-indicator-snap"
                  onClick={this._onSnapToggle}
                  title={`Snapping to ${this.state.snapToKeyframes ? 'keyframes' : 'whole numbers'} (K)`}>
                <Icon name={this.state.snapToKeyframes ? 'keyframes' : 'wholeNumbers'}/>
              </div>
            </div>
            <Button className="pl-timeline-header-control-add"
                onClick={this.props.onAddClick}>
              <Icon name="addLayer"/>
            </Button>
          </div>
          <div className="pl-timeline-header-track"
              onMouseDown={this._onHeaderTrackMouseDown}
              onWheel={this._onHeaderTrackWheel}>
            <div className="pl-timeline-header-track-ticks">
              {ticks.map(function(tick, index) {
                return <div className="pl-timeline-header-track-tick" key={index}/>;
              })}
            </div>
            {marker}
            <div className="pl-timeline-header-track-playhead"
                onMouseDown={this._onPlayheadMouseDown}
                style={{left: `${percentPlayed}%`}}/>
          </div>
        </div>
        <div className="pl-timeline-content"
            onMouseDown={this.props.selectLayer.bind(null, null)}>
          <div className={layersClassName}
              onScroll={this._onLayersScroll}
              onWheel={this._onLayersWheel}>
            {layers.map(layer => {
              return (
                <TimelineLayer key={layer.id}
                    layer={layer}
                    layers={this.props.layers}
                    linkable={this.state.linkingLayerId !== null &&
                        layer.id !== this.state.linkingLayerId}
                    onDragEnd={this._onLayerDragEnd}
                    onDragOver={this._onLayerDragOver}
                    onDragStart={this._onLayerDragStart.bind(null, layer.id)}
                    onLinkClick={this._onLayerLinkClick.bind(null, layer.id)}
                    onLinkTargetClick={this._onLayerLinkTargetClick.bind(null, layer.id)}
                    onSelect={this._onLayerSelect.bind(null, layer.id)}
                    onUnlinkClick={this._onLayerUnlinkClick.bind(null, layer.id)}
                    parent={layer.parent && this.props.layers.find(l => l.id === layer.parent.id)}
                    percentPlayed={this.props.percentPlayed}
                    selected={layer.id === this.props.selectedLayerId}
                    sticky={layer.id === this.state.stickyLayerId}
                    stuck={layer.id === this.state.stuckLayerId}/>
              );
            })}
          </div>
          <div className="pl-timeline-track" ref="track">{marker}</div>
        </div>
        <div className="pl-timeline-handle"
            onMouseDown={this._onHandleMouseDown}/>
      </div>
    );
  }
});

function mapStateToProps(state) {
  return {
    layers: state.layers.present
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onAddClick: function() {
      dispatch(addLayer('text'));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Timeline);
