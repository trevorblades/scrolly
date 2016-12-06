const React = require('react');
const classNames = require('classnames');

const Canvas = React.createClass({

  propTypes: {
    innerHeight: React.PropTypes.number,
    innerWidth: React.PropTypes.number,
    layers: React.PropTypes.object,
    outerHeight: React.PropTypes.number,
    outerWidth: React.PropTypes.number
  },

  getInitialState: function() {
    return {
      selectedLayer: null
    };
  },

  componentWillMount: function() {
    window.addEventListener('keydown', this._onKeyDown);
  },

  componentWillUnmount: function() {
    window.removeEventListener('keydown', this._onKeyDown);
  },

  _onKeyDown: function(event) {
    if (event.keyCode === 27) { // Escape key pressed
      this._deselectLayer();
    }
  },

  _onLayerClick: function(id, event) {
    event.stopPropagation();
    this.setState({selectedLayer: id});
  },

  _deselectLayer: function() {
    this.setState({selectedLayer: null});
  },

  render: function() {
    const innerAspectRatio = this.props.innerWidth / this.props.innerHeight;
    const outerAspectRatio = this.props.outerWidth / this.props.outerHeight;

    let viewportStyle = {};
    let viewportHeight = this.props.outerHeight;
    let viewportWidth = this.props.outerWidth;
    if (innerAspectRatio > outerAspectRatio) {
      viewportHeight = this.props.outerWidth / innerAspectRatio;
      viewportStyle = {height: viewportHeight};
    } else {
      viewportWidth = this.props.outerHeight * innerAspectRatio;
      viewportStyle = {width: viewportWidth};
    }

    return (
      <div className="pl-canvas">
        <div className="pl-canvas-viewport"
            onClick={this._deselectLayer}
            style={viewportStyle}>
          {Object.keys(this.props.layers).map(key => {
            const layer = this.props.layers[key];

            const x = viewportWidth * layer.x / this.props.innerWidth;
            const y = viewportHeight * layer.y / this.props.innerHeight;
            const style = {transform: `translate(${x}px, ${y}px)`};
            const props = {
              className: classNames('pl-canvas-viewport-layer', {
                'pl-selected': key === this.state.selectedLayer
              }),
              key: key,
              onClick: this._onLayerClick.bind(this, key),
              style: style
            };

            if (layer.type === 'text') {
              props.dangerouslySetInnerHTML = {__html: layer.value};
              props.style.fontSize = layer.fontSize;
              props.style.fontWeight = layer.fontWeight;
              props.style.fontStyle = layer.fontStyle;
              props.type = 'text';
              if (key === this.state.selectedLayer) {
                props.contentEditable = true;
                props.onBlur = this._deselectLayer;
              }
            }

            return <div key={key} {...props}/>;
          })}
        </div>
      </div>
    );
  }
});

module.exports = Canvas;
