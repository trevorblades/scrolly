const React = require('react');

const MIN_HEIGHT = 100;

const Timeline = React.createClass({

  propTypes: {
    layers: React.PropTypes.object.isRequired,
    maxHeight: React.PropTypes.number,
    onResize: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      height: 200,
      percentPlayed: 0
    };
  },

  componentWillMount: function() {
    document.addEventListener('keydown', this._onKeyDown);
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
    document.removeEventListener('keydown', this._onKeyDown);
  },

  _onKeyDown: function(event) {
    const tagName = event.target.tagName.toUpperCase();
    if (tagName !== 'INPUT' &&
        tagName !== 'TEXTAREA' &&
        (event.keyCode === 188 || event.keyCode === 190)) { // < or > key pressed
      event.preventDefault();

      let direction = event.keyCode === 188 ? -1 : 1;
      if (event.shiftKey) {
        direction *= 10;
      }
      this._setPercentPlayed(this.state.percentPlayed + direction);
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
    this._setPercentPlayed((this.refs.playhead.offsetLeft + event.movementX) /
        this.refs.track.offsetWidth * 100);
  },

  _onPlayheadMouseUp: function() {
    this.setState({scrubbing: false});
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _setPercentPlayed: function(value) {
    if (value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }
    this.setState({percentPlayed: value});
  },

  render: function() {
    return (
      <div className="pl-timeline" style={{height: this.state.height}}>
        <div className="pl-timeline-scrubber">
          <div className="pl-timeline-scrubber-info">
            <span>{`${this.state.percentPlayed.toFixed(2)}%`}</span>
          </div>
          <div className="pl-timeline-scrubber-track" ref="track">
            <div className="pl-timeline-scrubber-track-marker"
                style={{left: `${this.state.percentPlayed}%`}}/>
            <div className="pl-timeline-scrubber-track-playhead"
                onMouseDown={this._onPlayheadMouseDown}
                ref="playhead"
                style={{left: `${this.state.percentPlayed}%`}}/>
          </div>
        </div>
        <div className="pl-timeline-layers">
          {Object.keys(this.props.layers).map(key => {
            const layer = this.props.layers[key];
            return (
              <div className="pl-timeline-layer" key={key}>
                <div className="pl-timeline-layer-info">
                  <span>{layer.name}</span>
                </div>
                <div className="pl-timeline-layer-track">
                  <div className="pl-timeline-layer-track-marker"
                      style={{left: `${this.state.percentPlayed}%`}}/>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pl-timeline-handle"
            onMouseDown={this._onHandleMouseDown}/>
      </div>
    );
  }
});

module.exports = Timeline;
