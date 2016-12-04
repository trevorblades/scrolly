const React = require('react');

const Timeline = React.createClass({

  propTypes: {
    layers: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      percentPlayed: 0,
      scrubbing: false
    };
  },

  componentWillMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
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
        direction *= 10;
      }
      this._setPlayheadLeft(this.state.percentPlayed + direction);
    }
  },

  _onPlayheadMouseDown: function() {
    this.setState({scrubbing: true});
    document.addEventListener('mousemove', this._onPlayheadMouseMove);
    document.addEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _onPlayheadMouseMove: function(event) {
    this._setPlayheadLeft((this.refs.playhead.offsetLeft + event.movementX) /
        this.refs.timeline.offsetWidth * 100);
  },

  _onPlayheadMouseUp: function() {
    this.setState({scrubbing: false});
    document.removeEventListener('mousemove', this._onPlayheadMouseMove);
    document.removeEventListener('mouseup', this._onPlayheadMouseUp);
  },

  _setPlayheadLeft: function(value) {
    if (value < 0) {
      value = 0;
    } else if (value > 100) {
      value = 100;
    }
    this.setState({percentPlayed: value});
  },

  render: function() {
    return (
      <div className="pl-timeline" ref="timeline">
        <div className="pl-timeline-layers">
          {Object.keys(this.props.layers).map(function(key) {
            return <div className="pl-timeline-layer" key={key}/>;
          })}
        </div>
        <div className="pl-timeline-marker"
            style={{left: `${this.state.percentPlayed}%`}}/>
        <div className="pl-timeline-playhead"
            onMouseDown={this._onPlayheadMouseDown}
            ref="playhead"
            style={{left: `${this.state.percentPlayed}%`}}/>
      </div>
    );
  }
});

module.exports = Timeline;
