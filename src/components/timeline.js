const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');

const Button = require('./button');
const Icon = require('./icon');

const {
  addLayer,
  deleteLayer,
  setLayerProperties,
  toggleLayerVisibility
} = require('../actions');

const MIN_HEIGHT = 100;

let numTicks = 17;
const ticks = [];
for (var i = 0; i < numTicks; i++) {
  ticks.push({});
}

let Timeline = React.createClass({

  propTypes: {
    layers: React.PropTypes.array.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    onAddClick: React.PropTypes.func.isRequired,
    onDeleteClick: React.PropTypes.func.isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
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
      height: 200
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
    this.props.setPercentPlayed((this.refs.playhead.offsetLeft + event.movementX) /
        this.refs.track.offsetWidth);
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
      document.addEventListener('mousemove', this._onBarMouseMove);
      document.addEventListener('mouseup', this._onBarMouseUp);
    }
  },

  _onBarMouseMove: function(event) {
    const movement = event.movementX / this.refs.track.offsetWidth;
    this.setState({
      dragIn: this.state.dragIn + movement,
      dragOut: this.state.dragOut + movement
    });
  },

  _onBarMouseUp: function() {
    this.props.onPropertiesChange(this.state.draggingLayerId, {
      in: this.state.dragIn,
      out: this.state.dragOut
    });
    this.setState({draggingLayerId: null});
    document.removeEventListener('mouseup', this._onBarMouseUp);
    document.removeEventListener('mousemove', this._onBarMouseMove);
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

  render: function() {
    const percentPlayed = this.props.percentPlayed * 100;
    const marker = (
      <div className="pl-timeline-marker"
          style={{left: `${percentPlayed}%`}}/>
    );

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
                ref="playhead"
                style={{left: `${percentPlayed}%`}}/>
          </div>
        </div>
        <div className="pl-timeline-content"
            onMouseDown={this.props.selectLayer.bind(null, null)}>
          <div className="pl-timeline-layers">
            {this.props.layers.map(layer => {
              const layerClassName = classNames('pl-timeline-layer', {
                'pl-selected': layer.id === this.props.selectedLayerId,
                'pl-hidden': !layer.visible
              });

              const actions = [
                {
                  icon: layer.visible ? 'visible' : 'invisible',
                  onClick: this.props.onVisiblityToggle
                },
                {
                  icon: 'delete',
                  onClick: this.props.onDeleteClick
                }
              ];

              return (
                <div className={layerClassName}
                    key={layer.id}
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
                            }}>
                          <Icon name={action.icon}/>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pl-timeline-tracks">
            <div className="pl-timeline-tracks-wrapper">
              {this.props.layers.map(layer => {
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
      dispatch(addLayer());
    },
    onDeleteClick: function(id) {
      dispatch(deleteLayer(id));
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
