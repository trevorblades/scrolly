const React = require('react');
const ReactDOM = require('react-dom');

const Canvas = React.createClass({

  propTypes: {
    height: React.PropTypes.number,
    width: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      containerHeight: 0,
      containerWidth: 0
    };
  },

  componentDidMount: function() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this._onResize);
  },

  _onResize: function() {
    const container = ReactDOM.findDOMNode(this);
    this.setState({
      containerHeight: container.offsetHeight,
      containerWidth: container.offsetWidth
    });
  },

  render: function() {
    const aspectRatio = this.props.width / this.props.height;
    const containerAspectRatio = this.state.containerWidth / this.state.containerHeight;
    let viewportStyle = aspectRatio > containerAspectRatio ?
        {height: this.state.containerWidth / aspectRatio} :
        {width: this.state.containerHeight * aspectRatio};
    return (
      <div className="pl-canvas">
        <div className="pl-canvas-viewport"
            style={viewportStyle}/>
      </div>
    );
  }
});

module.exports = Canvas;
