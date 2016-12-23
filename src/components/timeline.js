const React = require('react');
const {connect} = require('react-redux');

const Button = require('./button');
const Icon = require('./icon');
const Layer = require('./layer');

const {addLayer, orderLayers} = require('../actions');

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
    layers: React.PropTypes.array.isRequired,
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
      sortId: null,
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
    this.setState({
      sortId: id,
      sortOrder: this.props.layers.map(layer => layer.id)
    });
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
    }

    this.props.setPercentPlayed(percentPlayed);
  },

  _onPlayheadMouseUp: function() {
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
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
          <div className="pl-timeline-header-control">
            <div className="pl-timeline-header-control-indicator">{`${percentPlayed.toFixed(2)}%`}</div>
            <Button className="pl-timeline-header-control-add"
                onClick={this.props.onAddClick}>
              <Icon name="addLayer"/>
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
          <div className="pl-timeline-track">{marker}</div>
          <div className="pl-timeline-layers">
            {layers.map(layer => {
              return (
                <Layer key={layer.id}
                    layer={layer}
                    onDragEnd={this._onLayerDragEnd}
                    onDragOver={this._onLayerDragOver}
                    onDragStart={this._onLayerDragStart}
                    onSelect={this._onLayerSelect.bind(null, layer.id)}
                    percentPlayed={this.props.percentPlayed}
                    selected={layer.id === this.props.selectedLayerId}/>
              );
            })}
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
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Timeline);
