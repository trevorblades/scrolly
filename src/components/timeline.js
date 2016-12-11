const React = require('react');
const classNames = require('classnames');

const MIN_HEIGHT = 100;

const Timeline = React.createClass({

  propTypes: {
    layers: React.PropTypes.object.isRequired,
    maxHeight: React.PropTypes.number,
    onLayerChange: React.PropTypes.func,
    onResize: React.PropTypes.func,
    percentPlayed: React.PropTypes.number,
    selectLayer: React.PropTypes.func,
    selectedLayer: React.PropTypes.string,
    setPercentPlayed: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      height: 200
    };
  },

  componentWillMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
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

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
  },

  _onKeyDown: function(event) {
    const tagName = event.target.tagName.toUpperCase();
    if (tagName !== 'INPUT' &&
        tagName !== 'TEXTAREA' &&
        (event.keyCode === 188 || event.keyCode === 190)) { // < or > key pressed
      event.preventDefault();

      let direction = event.keyCode === 188 ? -1 : 1;
      if (event.shiftKey) {
        direction *= 0.1;
      }
      this.setPercentPlayed(this.props.percentPlayed + direction);
    }
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
    this.setState({scrubbing: true});
    document.addEventListener('mousemove', this._onPlayheadMouseMove);
    document.addEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onPlayheadMouseMove: function(event) {
    this.props.setPercentPlayed((this.refs.playhead.offsetLeft + event.movementX) /
        this.refs.track.offsetWidth);
  },

  _onPlayheadMouseUp: function() {
    this.setState({scrubbing: false});
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onBarMouseDown: function(id) {
    if (id !== this.props.selectedLayer) {
      this.props.selectLayer(id);
    }

    if (!this._boundBarMouseMove) {
      this._boundBarMouseMove = this._onBarMouseMove.bind(null, id);
      document.addEventListener('mousemove', this._boundBarMouseMove);
      document.addEventListener('mouseup', this._onBarMouseUp);
    }
  },

  _onBarMouseMove: function(id, event) {
    const layer = this.props.layers[id];
    const percentMoved = event.movementX / this.refs.track.offsetWidth;
    this.props.onLayerChange(id, {
      in: layer.in + percentMoved,
      out: layer.out + percentMoved
    });
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
    this.props.onLayerChange(id, {[index ? 'out' : 'in']: position});
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
            <span>{`${percentPlayed.toFixed(2)}%`}</span>
          </div>
          <div className="pl-timeline-header-track" ref="track">
            {marker}
            <div className="pl-timeline-header-track-playhead"
                onMouseDown={this._onPlayheadMouseDown}
                ref="playhead"
                style={{left: `${percentPlayed}%`}}/>
          </div>
        </div>
        <div className="pl-timeline-content">
          <div className="pl-timeline-layers">
            {Object.keys(this.props.layers).map(key => {
              const layer = this.props.layers[key];
              return (
                <div className="pl-timeline-layer" key={key}>
                  <span>{layer.name}</span>
                </div>
              );
            })}
          </div>
          <div className="pl-timeline-tracks">
            <div className="pl-timeline-tracks-wrapper">
              {Object.keys(this.props.layers).map(id => {
                const handles = [];
                for (var i = 0; i < 2; i++) {
                  handles.push(
                    <div className="pl-timeline-track-bar-handle"
                        key={i}
                        onMouseDown={this._onBarHandleMouseDown.bind(null, id, i)}/>
                  );
                }

                const layer = this.props.layers[id];
                const barClassName = classNames('pl-timeline-track-bar', {
                  'pl-selected': id === this.props.selectedLayer
                });
                return (
                  <div className="pl-timeline-track" key={id}>
                    <div className={barClassName}
                        onMouseDown={this._onBarMouseDown.bind(null, id)}
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

module.exports = Timeline;
