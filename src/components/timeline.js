const React = require('react');

const Timeline = React.createClass({

  propTypes: {
    layers: React.PropTypes.array
  },

  getInitialState: function() {
    return {
      playheadFraction: 0,
      scrubbing: false
    };
  },

  _onPlayheadMouseDown: function() {
    this.setState({scrubbing: true});
    document.addEventListener('mousemove', this._onScrub);
    document.addEventListener('mouseup', this._onScrubEnd);
  },

  _onScrub: function(event) {
    const playheadPosition = this.refs.playhead.offsetLeft;
    let playheadFraction = (playheadPosition + event.movementX) / this.refs.workArea.offsetWidth;
    if (playheadFraction < 0) {
      playheadFraction = 0;
    } else if (playheadFraction > 1) {
      playheadFraction = 1;
    }
    this.setState({playheadLeft: playheadFraction * 100});
  },

  _onScrubEnd: function() {
    document.removeEventListener('mousemove', this._onScrub);
    document.removeEventListener('mouseup', this._onScrubEnd);
  },

  render: function() {
    return (
      <div className="pl-timeline">
        <div className="pl-timeline-layers">
          {this.props.layers.map(function(layer) {
            return (
              <div className="pl-timeline-layer" key={layer.id}>
                <span>{layer.name}</span>
              </div>
            );
          })}
        </div>
        <div className="pl-timeline-work-area" ref="workArea">
          <div className="pl-timeline-work-area-marker"
              style={{left: `${this.state.playheadLeft}%`}}/>
          <div className="pl-timeline-work-area-playhead"
              onMouseDown={this._onPlayheadMouseDown}
              ref="playhead"
              style={{left: `${this.state.playheadLeft}%`}}/>
        </div>
      </div>
    );
  }
});

module.exports = Timeline;
