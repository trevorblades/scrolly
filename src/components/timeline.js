const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const upperCaseFirst = require('upper-case-first');

const Button = require('./button');
const Control = require('./control');
const Icon = require('./icon');
const TextField = require('./text-field');
const TimelineLayer = require('./timeline-layer');

const {
  addLayer,
  linkLayers,
  orderLayers,
  setPercentPlayed,
  selectLayer
} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const getParentProperties = require('../util/get-parent-properties');
const getParents = require('../util/get-parents');
const isInput = require('../util/is-input');
const layerPropType = require('../util/layer-prop-type');
const shouldSnap = require('../util/should-snap');

const MIN_HEIGHT = 200;

let numTicks = 17;
const ticks = [];
for (let i = 0; i < numTicks; i++) {
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
    selectLayer: React.PropTypes.func.isRequired,
    selectedLayer: React.PropTypes.number,
    setPercentPlayed: React.PropTypes.func.isRequired,
    step: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
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
    } else if ((event.keyCode === 188 || event.keyCode === 190) && !isInput(event.target)) { // < or > key pressed
      event.preventDefault();
      let movement = event.keyCode === 188 ? -1 : 1;
      movement /= event.shiftKey ? 10 : 100;
      this.props.setPercentPlayed(this.props.percentPlayed + movement);
    }
  },

  _onLayersScroll: function(event) {
    let stickyLayerId = null;
    let stuckLayerId = null;
    const scrollPos = event.currentTarget.scrollTop;
    const layers = event.currentTarget.childNodes;
    for (let i = layers.length - 1; i >= 0; i--) {
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
    const sortOrder = this.state.sortOrder.slice();
    sortOrder.reverse();
    this.props.dispatch(orderLayers(sortOrder));
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
    for (let i = sortOrder.length - 1; i >= 0; i--) {
      if (sortOrder[i] !== this.state.sortOrder[i]) {
        changed = true;
        break;
      }
    }

    if (changed) {
      this.setState({sortOrder});
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

  _onLayerLinkTargetClick: function(layer, event) {
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

    this.props.dispatch(linkLayers(this.state.linkingLayerId, {
      id: layer.id,
      offsetX: offsetX,
      offsetY: offsetY,
      offsetScale: offsetScale
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
    const movementY = event.deltaY / this.props.step;
    const percentPlayed = (this.refs.track.offsetWidth * this.props.percentPlayed + movementY) / this.refs.track.offsetWidth;
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
          for (let property in layer) {
            const value = layer[property];
            if ((property === 'in' || property === 'out') &&
                shouldSnap(value, percentPlayed)) {
              obj[value] = true;
            } else if (typeof value === 'object') {
              for (let key in value) {
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

  _onAddToggle: function() {
    this.setState({adding: !this.state.adding});
  },

  _onAddLayerClick: function(type) {
    this.props.dispatch(addLayer(type));
    this.setState({adding: false});
  },

  _deselectLayer: function() {
    this.props.selectLayer(null);
  },

  render: function() {
    const percentPlayed = this.props.percentPlayed * 100;
    const marker = (
      <div className="sv-timeline-marker"
          style={{left: `${percentPlayed}%`}}/>
    );

    const layers = this.state.sortOrder ?
        this.state.sortOrder.map(id => {
          return this.props.layers.find(layer => layer.id === id);
        }) : this.props.layers;

    const layersClassName = classNames('sv-timeline-layers', {
      'sv-scrolling': this.state.scrolling
    });

    const menuActions = [
      {
        content: (
          <div className="sv-timeline-header-menu-step">
            <TextField onChange={this.props.onStepChange}
                type="number"
                value={this.props.step}/>
            <Icon name="scroll"/>
          </div>
        ),
        title: 'Step amount (pixels scrolled for every percent played)'
      },
      {
        content: <Icon name={this.state.snapToKeyframes ? 'keyframes' : 'wholeNumbers'}/>,
        onClick: this._onSnapToggle,
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
            <Button className={addClassName}
                onClick={this._onAddToggle}
                title="Add a layer">
              <Icon name={this.state.adding ? 'close' : 'add'}/>
            </Button>
          </div>
          <div className="sv-timeline-header-track"
              onMouseDown={this._onHeaderTrackMouseDown}
              onWheel={this._onHeaderTrackWheel}>
            <div className="sv-timeline-header-track-ticks">
              {ticks.map(function(tick, index) {
                return <div className="sv-timeline-header-track-tick" key={index}/>;
              })}
            </div>
            {marker}
            <div className="sv-timeline-header-track-playhead"
                onMouseDown={this._onPlayheadMouseDown}
                style={{left: `${percentPlayed}%`}}/>
          </div>
        </div>
        <div className="sv-timeline-content"
            onMouseDown={this._deselectLayer}>
          <div className={layersClassName}
              onScroll={this._onLayersScroll}
              onWheel={this._onLayersWheel}>
            {layers.map(layer => {
              const parents = getParents(layer, this.props.layers);
              const parentIds = parents.map(parent => parent.id);
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
                    onLinkTargetClick={this._onLayerLinkTargetClick.bind(null, layer)}
                    parent={layer.parent &&
                        this.props.layers.find(l => l.id === layer.parent.id)}
                    percentPlayed={this.props.percentPlayed}
                    selected={layer.id === this.props.selectedLayer}
                    sticky={layer.id === this.state.stickyLayerId}
                    stuck={layer.id === this.state.stuckLayerId}
                    unlinkable={parentIds.indexOf(this.state.linkingLayerId) !== -1}/>
              );
            })}
          </div>
          {this.state.adding && <div className="sv-timeline-layer-options">
            {['dummy', 'text'].map((type, index) => {
              const title = `Add ${type} layer`;
              return (
                <div className="sv-timeline-layer-option"
                    key={index}
                    onClick={this._onAddLayerClick.bind(null, type)}
                    title={title}>
                  <Icon name={`add${upperCaseFirst(type)}Layer`}/>
                  <span>{title}</span>
                </div>
              );
            })}
          </div>}
          <div className="sv-timeline-track" ref="track">{marker}</div>
        </div>
        <div className="sv-timeline-handle"
            onMouseDown={this._onHandleMouseDown}/>
      </div>
    );
  }
});

function mapStateToProps(state) {
  const layers = state.layers.present.slice();
  layers.reverse();
  return {
    getInterpolatedValue: function(value) {
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
    onStepChange: function(value) {
      if (value < 1) {
        value = 1;
      }
      dispatch({type: 'SET_STEP', value});
    },
    setPercentPlayed: function(value) {
      dispatch(setPercentPlayed(value));
    },
    selectLayer: function(id) {
      dispatch(selectLayer(id));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Timeline);
