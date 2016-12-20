const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const sentenceCase = require('sentence-case');

const Button = require('./button');
const Icon = require('./icon');

const {
  addLayer,
  removeLayer,
  orderLayers,
  setLayerProperties,
  toggleLayerVisibility
} = require('../actions');
const {PROPERTIES} = require('../constants');

const MIN_HEIGHT = 100;

const animatedProperties = [];
for (var key in PROPERTIES) {
  if (PROPERTIES[key].animated) {
    animatedProperties.push(key);
  }
}

let numTicks = 17;
const ticks = [];
for (var i = 0; i < numTicks; i++) {
  ticks.push({});
}

let Timeline = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.array.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    onAddClick: React.PropTypes.func.isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    onRemoveClick: React.PropTypes.func.isRequired,
    onResize: React.PropTypes.func.isRequired,
    onVisiblityToggle: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selectLayer: React.PropTypes.func.isRequired,
    selectedLayerId: React.PropTypes.number,
    setPercentPlayed: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      dragIn: null,
      dragOut: null,
      draggingLayerId: null,
      expandedLayerId: null,
      height: 200,
      sortingLayerId: null,
      sortOrder: null
    };
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

  _onLayerDragEnd: function() {
    this.props.dispatch(orderLayers(this.state.sortOrder));
    this.setState({
      sortingLayerId: null,
      sortOrder: null
    });
  },

  _onLayerDragOver: function(event) {
    const layer = event.currentTarget;
    const layerIndex = this.state.sortOrder.indexOf(this.state.sortingLayerId);
    const targetIndex = Array.from(layer.parentNode.children).indexOf(layer);
    const sortOrder = this.state.sortOrder.slice();
    sortOrder.splice(layerIndex, 1);
    sortOrder.splice(targetIndex, 0, this.state.sortingLayerId);

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
    this.setState({
      sortingLayerId: id,
      sortOrder: this.props.layers.map(layer => layer.id)
    });
  },

  _onLayerMouseDown: function(id, event) {
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
      percentPlayed = Math.round(percentPlayed * 100) / 100;
    }
    this.props.setPercentPlayed(percentPlayed);
  },

  _onPlayheadMouseUp: function() {
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onBarMouseDown: function(layer, event) {
    if (event.button === 0) {
      event.stopPropagation();
      if (layer.id !== this.props.selectedLayerId) {
        this.props.selectLayer(layer.id);
      }

      this.setState({
        dragIn: layer.in,
        dragOut: layer.out,
        draggingLayerId: layer.id
      });

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      this._boundBarMouseMove = this._onBarMouseMove.bind(null, offsetX);
      document.addEventListener('mousemove', this._boundBarMouseMove);
      document.addEventListener('mouseup', this._onBarMouseUp);
    }
  },

  _onBarMouseMove: function(offsetX, event) {
    const barSize = this.state.dragOut - this.state.dragIn;
    let dragIn = ((event.clientX - offsetX) - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    let dragOut = dragIn + barSize;
    if (dragIn < 0) {
      dragIn = 0;
      dragOut = barSize;
    } else if (dragOut > 1) {
      dragOut = 1;
      dragIn = dragOut - barSize;
    }
    this.setState({
      dragIn: dragIn,
      dragOut: dragOut
    });
  },

  _onBarMouseUp: function() {
    this.props.onPropertiesChange(this.state.draggingLayerId, {
      in: this.state.dragIn,
      out: this.state.dragOut
    });
    this.setState({draggingLayerId: null});
    document.removeEventListener('mousemove', this._boundBarMouseMove);
    document.removeEventListener('mouseup', this._onBarMouseUp);
    delete this._boundBarMouseMove;
  },

  _onBarHandleMouseDown: function(layer, index, event) {
    if (event.button === 0) {
      event.stopPropagation();
      this.setState({
        dragIn: layer.in,
        dragOut: layer.out,
        draggingLayerId: layer.id
      });
      this._boundBarHandleMouseMove = this._onBarHandleMouseMove.bind(null, index);
      document.addEventListener('mousemove', this._boundBarHandleMouseMove);
      document.addEventListener('mouseup', this._onBarHandleMouseUp);
    }
  },

  _onBarHandleMouseMove: function(index, event) {
    let position = (event.clientX - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    if (position < 0) {
      position = 0;
    } else if (position > 1) {
      position = 1;
    }
    this.setState({[`drag${index ? 'Out' : 'In'}`]: position});
  },

  _onBarHandleMouseUp: function() {
    this.props.onPropertiesChange(this.state.draggingLayerId, {
      in: this.state.dragIn,
      out: this.state.dragOut
    });
    this.setState({draggingLayerId: null});
    document.removeEventListener('mouseup', this._onBarHandleMouseUp);
    document.removeEventListener('mousemove', this._boundBarHandleMouseMove);
    delete this._boundBarHandleMouseMove;
  },

  _onExpandClick: function(id) {
    const expandedLayerId = id === this.state.expandedLayerId ? null : id;
    this.setState({expandedLayerId: expandedLayerId});
  },

  _onAnimateToggle: function(id, property) {
    let nextValue;
    const layer = this.props.layers.find(layer => layer.id === id);
    const value = layer[property];
    if (typeof value === 'object') {
      const key = Object.keys(value)[0];
      nextValue = value[key];
    } else {
      nextValue = {[this.props.percentPlayed]: value};
    }
    this.props.onPropertiesChange(id, {[property]: nextValue});
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

    return (
      <div className="pl-timeline" style={{height: this.state.height}}>
        <div className="pl-timeline-header">
          <div className="pl-timeline-header-status">
            <div className="pl-timeline-header-status-indicator">{`${percentPlayed.toFixed(2)}%`}</div>
            <Button className="pl-timeline-header-status-add"
                onClick={this.props.onAddClick}>
              <Icon name="add"/>
            </Button>
          </div>
          <div className="pl-timeline-header-track"
              onMouseDown={this._onHeaderTrackMouseDown}
              onWheel={this._onHeaderTrackWheel}
              ref="track">
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
          <div className="pl-timeline-layers">
            {layers.map(layer => {
              const layerClassName = classNames('pl-timeline-layer', {
                'pl-selected': layer.id === this.props.selectedLayerId,
                'pl-hidden': !layer.visible
              });

              const actions = [
                {
                  icon: 'chevron',
                  onClick: this._onExpandClick
                },
                {
                  icon: layer.visible ? 'visible' : 'invisible',
                  onClick: this.props.onVisiblityToggle
                },
                {
                  icon: 'trash',
                  onClick: this.props.onRemoveClick
                }
              ];

              const properties = animatedProperties.filter(property => layer[property]);

              return (
                <div className={layerClassName}
                    draggable
                    key={layer.id}
                    onDragEnd={this._onLayerDragEnd}
                    onDragOver={this._onLayerDragOver}
                    onDragStart={this._onLayerDragStart.bind(null, layer.id)}
                    onMouseDown={this._onLayerMouseDown.bind(null, layer.id)}>
                  <div className="pl-timeline-layer-name">
                    {layer.name}
                  </div>
                  <div className="pl-timeline-layer-actions">
                    {actions.map((action, index) => {
                      return (
                        <div className="pl-timeline-layer-action"
                            key={index}
                            onClick={function(event) {
                              event.stopPropagation();
                              action.onClick(layer.id);
                            }}
                            onMouseDown={event => event.stopPropagation()}>
                          <Icon name={action.icon}/>
                        </div>
                      );
                    })}
                  </div>
                  {layer.id === this.state.expandedLayerId &&
                    <div className="pl-timeline-layer-properties">
                      {properties.map(property => {
                        const animateClassName = classNames('pl-timeline-layer-property-animate', {
                          'pl-active': typeof layer[property] === 'object'
                        });
                        return (
                          <div className="pl-timeline-layer-property"
                              key={property}>
                            <span>{sentenceCase(property)}</span>
                            <div className={animateClassName}
                                onClick={this._onAnimateToggle.bind(null, layer.id, property)}/>
                          </div>
                        );
                      })}
                    </div>}
                </div>
              );
            })}
          </div>
          <div className="pl-timeline-tracks">
            <div className="pl-timeline-tracks-wrapper">
              {layers.map(layer => {
                const handles = [];
                for (var i = 0; i < 2; i++) {
                  handles.push(
                    <div className="pl-timeline-track-bar-handle"
                        key={i}
                        onMouseDown={this._onBarHandleMouseDown.bind(null, layer, i)}/>
                  );
                }

                const barClassName = classNames('pl-timeline-track-bar', {
                  'pl-selected': layer.id === this.props.selectedLayerId,
                  'pl-hidden': !layer.visible
                });

                let layerIn = layer.in;
                let layerOut = layer.out;
                if (layer.id === this.state.draggingLayerId) {
                  layerIn = this.state.dragIn;
                  layerOut = this.state.dragOut;
                }

                const properties = animatedProperties.filter(property => layer[property]);
                return (
                  <div className="pl-timeline-track" key={layer.id}>
                    <div className={barClassName}
                        onClick={event => event.stopPropagation()}
                        onMouseDown={this._onBarMouseDown.bind(null, layer)}
                        style={{
                          left: `${layerIn * 100}%`,
                          right: `${100 - layerOut * 100}%`
                        }}>
                      {handles}
                    </div>
                    {layer.id === this.state.expandedLayerId &&
                      <div className="pl-timeline-track-properties">
                        {properties.map(function(property) {
                          let keyframes = [];
                          if (typeof layer[property] === 'object') {
                            keyframes = Object.keys(layer[property]);
                          }
                          return (
                            <div className="pl-timeline-track-property"
                                key={property}>
                              {keyframes.map(function(keyframe, index) {
                                return (
                                  <div className="pl-timeline-track-property-keyframe"
                                      key={index}
                                      style={{left: `${keyframe * 100}%`}}/>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>}
                  </div>
                );
              })}
              {marker}
            </div>
          </div>
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
    },
    onRemoveClick: function(id) {
      dispatch(removeLayer(id));
    },
    onVisiblityToggle: function(id) {
      dispatch(toggleLayerVisibility(id));
    },
    onPropertiesChange: function(id, properties) {
      dispatch(setLayerProperties(id, properties));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Timeline);
