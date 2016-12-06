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

            let extraProps;
            if (layer.type === 'text') {
              style.fontSize = layer.fontSize;
              style.fontWeight = layer.fontWeight;
              style.fontStyle = layer.fontStyle;
              extraProps = {
                dangerouslySetInnerHTML: {__html: layer.value},
                type: 'text'
              };
              if (key === this.state.selectedLayer) {
                extraProps.contentEditable = true;
                extraProps.onBlur = this._deselectLayer;
              }
            }

            const canvasClassName = classNames('pl-canvas-viewport-layer', {
              'pl-selected': key === this.state.selectedLayer
            });
            return (
              <div className={canvasClassName}
                  key={key}
                  onClick={this._onLayerClick.bind(this, key)}
                  style={style}
                  {...extraProps}/>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Canvas;
