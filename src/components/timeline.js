const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');

const Button = require('./button');
const Icon = require('./icon');

const {
  addLayer,
  deleteLayer,
  setLayerProperties,
  incrementLayerProperties,
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
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.array.isRequired,
    maxHeight: React.PropTypes.number.isRequired,
    onAddClick: React.PropTypes.func.isRequired,
    onDeleteClick: React.PropTypes.func.isRequired,
    onResize: React.PropTypes.func.isRequired,
    onVisiblityToggle: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selectLayer: React.PropTypes.func.isRequired,
    selectedLayerId: React.PropTypes.number,
    setPercentPlayed: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
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

  _onHeaderTrackMouseDown: function(event) {
    const percentPlayed = (event.clientX - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    this.props.setPercentPlayed(percentPlayed);
    this._onPlayheadMouseDown();
  },

  _onHandleMouseDown: function() {
    document.addEventListener('mousemove', this._onHandleMouseMove);
    document.addEventListener('mouseup', this._onHandleMouseUp);
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

  _onPlayheadMouseDown: function() {
    document.addEventListener('mousemove', this._onPlayheadMouseMove);
    document.addEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onPlayheadMouseMove: function(event) {
    this.props.setPercentPlayed((this.refs.playhead.offsetLeft + event.movementX) /
        this.refs.track.offsetWidth);
  },

  _onPlayheadMouseUp: function() {
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onBarMouseDown: function(id) {
    if (id !== this.props.selectedLayerId) {
      this.props.selectLayer(id);
    }

    if (!this._boundBarMouseMove) {
      this._boundBarMouseMove = this._onBarMouseMove.bind(null, id);
      document.addEventListener('mousemove', this._boundBarMouseMove);
      document.addEventListener('mouseup', this._onBarMouseUp);
    }
  },

  _onBarMouseMove: function(id, event) {
    const percentMoved = event.movementX / this.refs.track.offsetWidth;
    this.props.dispatch(incrementLayerProperties(id, {
      in: percentMoved,
      out: percentMoved
    }));
  },

  _onBarMouseUp: function() {
    document.removeEventListener('mousemove', this._boundBarMouseMove);
    document.removeEventListener('mouseup', this._onBarMouseUp);
    delete this._boundBarMouseMove;
  },

  _onBarHandleMouseDown: function(id, index, event) {
    event.stopPropagation();
    if (!this._boundBarHandleMouseMove) {
      this._boundBarHandleMouseMove = this._onBarHandleMouseMove.bind(null, id, index);
      document.addEventListener('mousemove', this._boundBarHandleMouseMove);
      document.addEventListener('mouseup', this._onBarHandleMouseUp);
    }
  },

  _onBarHandleMouseMove: function(id, index, event) {
    let position = (event.clientX - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    if (position < 0) {
      position = 0;
    } else if (position > 1) {
      position = 1;
    }
    this.props.dispatch(setLayerProperties(id, {
      [index ? 'out' : 'in']: position
    }));
  },

  _onBarHandleMouseUp: function() {
    document.removeEventListener('mousemove', this._boundBarHandleMouseMove);
    document.removeEventListener('mouseup', this._onBarHandleMouseUp);
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
        <div className="pl-timeline-content">
          <div className="pl-timeline-layers">
            {this.props.layers.map(layer => {
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

              const layerClassName = classNames('pl-timeline-layer', {
                'pl-hidden': !layer.visible
              });

              return (
                <div className={layerClassName}
                    key={layer.id}
                    onClick={this.props.selectLayer.bind(null, layer.id)}>
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
                        onMouseDown={this._onBarHandleMouseDown.bind(null, layer.id, i)}/>
                  );
                }

                const barClassName = classNames('pl-timeline-track-bar', {
                  'pl-selected': layer.id === this.props.selectedLayerId,
                  'pl-hidden': !layer.visible
                });

                return (
                  <div className="pl-timeline-track" key={layer.id}>
                    <div className={barClassName}
                        onMouseDown={layer.visible && this._onBarMouseDown.bind(null, layer.id)}
                        style={{
                          left: `${layer.in * 100}%`,
                          right: `${100 - layer.out * 100}%`
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
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Timeline);
