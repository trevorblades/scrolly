const React = require('react');

const Canvas = React.createClass({

  propTypes: {
    innerHeight: React.PropTypes.number,
    innerWidth: React.PropTypes.number,
    outerHeight: React.PropTypes.number,
    outerWidth: React.PropTypes.number
  },

  render: function() {
    const innerAspectRatio = this.props.innerWidth / this.props.innerHeight;
    const outerAspectRatio = this.props.outerWidth / this.props.outerHeight;
    let viewportStyle = innerAspectRatio > outerAspectRatio ?
        {height: this.props.outerWidth / innerAspectRatio} :
        {width: this.props.outerHeight * innerAspectRatio};
    return (
      <div className="pl-canvas">
        <div className="pl-canvas-viewport"
            style={viewportStyle}/>
      </div>
    );
  }
});

module.exports = Canvas;
