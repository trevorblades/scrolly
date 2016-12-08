const React = require('react');
const classNames = require('classnames');

function getViewportDimensions(options) {
  const compositionAspectRatio = options.compositionWidth / options.compositionHeight;
  const outerAspectRatio = options.outerWidth / options.outerHeight;

  let viewportHeight = options.outerHeight;
  let viewportWidth = options.outerWidth;
  if (compositionAspectRatio > outerAspectRatio) {
    viewportHeight = options.outerWidth / compositionAspectRatio;
  } else {
    viewportWidth = options.outerHeight * compositionAspectRatio;
  }
  return {
    viewportHeight: viewportHeight,
    viewportWidth: viewportWidth
  };
}

const Canvas = React.createClass({

  propTypes: {
    compositionHeight: React.PropTypes.number,
    compositionWidth: React.PropTypes.number,
    layers: React.PropTypes.object,
    onLayerChange: React.PropTypes.func,
    outerHeight: React.PropTypes.number,
    outerWidth: React.PropTypes.number
  },

  getInitialState: function() {
    const viewportDimensions = getViewportDimensions(this.props);
    return Object.assign(viewportDimensions, {
      editingLayer: null,
      movingLayer: null,
      selectedLayer: null
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.compositionHeight !== this.props.compositionHeight ||
        nextProps.compositionWidth !== this.props.compositionWidth ||
        nextProps.outerHeight !== this.props.outerHeight ||
        nextProps.outerWidth !== this.props.outerWidth) {
      this.setState(getViewportDimensions(nextProps));
    }
  },

  componentWillUnmount: function() {
    document.removeEventListener('keydown', this._onKeyDown);
  },

  _onKeyDown: function(event) {
    if (event.keyCode === 27) { // Escape key pressed
      if (event.target.contentEditable === 'true') { // It happened on a text layer
        return event.target.blur();
      }
      this._deselectLayer();
    }
  },

  _onCanvasClick: function() {
    if (this.state.selectedLayer) {
      this._deselectLayer();
    }
  },

  _onLayerClick: function(id, event) {
    event.stopPropagation();
    if (id !== this.state.selectedLayer) {
      this.setState({selectedLayer: id});
      document.addEventListener('keydown', this._onKeyDown);
    }
  },

  _onLayerMouseDown: function(id, event) {
    const layerRect = event.target.getBoundingClientRect();
    this.setState({
      movingLayer: id,
      movingLayerOffsetX: event.clientX - layerRect.left,
      movingLayerOffsetY: event.clientY - layerRect.top
    });
    document.addEventListener('mousemove', this._onLayerMouseMove);
    document.addEventListener('mouseup', this._onLayerMouseUp);
  },

  _onLayerMouseMove: function(event) {
    let layerX = event.clientX - this.refs.viewport.offsetLeft - this.state.movingLayerOffsetX;
    const minX = this.state.movingLayerOffsetX * -1;
    const maxX = this.state.viewportWidth - this.state.movingLayerOffsetX;
    if (layerX < minX) {
      layerX = minX;
    } else if (layerX > maxX) {
      layerX = maxX;
    }

    let layerY = event.clientY - this.refs.viewport.offsetTop - this.state.movingLayerOffsetY;
    const minY = this.state.movingLayerOffsetY * -1;
    const maxY = this.state.viewportHeight - this.state.movingLayerOffsetY;
    if (layerY < minY) {
      layerY = minY;
    } else if (layerY > maxY) {
      layerY = maxY;
    }

    const scale = this.props.compositionWidth / this.state.viewportWidth;
    this.props.onLayerChange(this.state.movingLayer, {
      x: layerX * scale,
      y: layerY * scale
    });
  },

  _onLayerMouseUp: function() {
    this.setState({movingLayer: null});
    document.removeEventListener('mousemove', this._onLayerMouseMove);
    document.removeEventListener('mouseup', this._onLayerMouseUp);
  },

  _onTextLayerBlur: function(event) {
    this.props.onLayerChange(this.state.selectedLayer, {value: event.target.innerHTML});
    this._deselectLayer();
  },

  _onTextLayerDoubleClick: function(id, event) {
    event.stopPropagation();
    const target = event.target;
    if (id !== this.state.editingLayer) {
      this.setState({editingLayer: id}, function() {
        target.focus();
        document.execCommand('selectAll', false, null);
      });
    }
  },

  _deselectLayer: function() {
    this.setState({
      editingLayer: null,
      selectedLayer: null
    });
    window.removeEventListener('keydown', this._onKeyDown);
  },

  render: function() {
    return (
      <div className="pl-canvas">
        <div className="pl-canvas-viewport"
            onClick={this._onCanvasClick}
            ref="viewport"
            style={{
              width: this.state.viewportWidth,
              height: this.state.viewportHeight
            }}>
          {Object.keys(this.props.layers).map(key => {
            const layer = this.props.layers[key];

            let children;
            const style = {
              top: this.state.viewportHeight * layer.y / this.props.compositionHeight,
              left: this.state.viewportWidth * layer.x / this.props.compositionWidth
            };

            if (layer.type === 'text') {
              style.fontSize = layer.fontSize;
              style.fontWeight = layer.fontWeight;
              style.fontStyle = layer.fontStyle;

              const editing = key === this.state.editingLayer;
              children = (
                <span className="pl-canvas-viewport-layer-text"
                    contentEditable={editing}
                    onBlur={editing && this._onTextLayerBlur}
                    onDoubleClick={this._onTextLayerDoubleClick.bind(null, key)}>
                  {layer.value}
                </span>
              );
            }


            const handles = [];
            for (let i = 0; i < 8; i++) {
              handles.push(
                <div className="pl-canvas-viewport-layer-handle"
                    key={i}
                    style={{
                      top: 0,
                      left: `${(i / 2) * 100}%`
                    }}/>
              );
            }

            const layerClassName = classNames('pl-canvas-viewport-layer', {
              'pl-selected': key === this.state.selectedLayer
            });

            return (
              <div className={layerClassName}
                  key={key}
                  onClick={this._onLayerClick.bind(null, key)}
                  onMouseDown={this._onLayerMouseDown.bind(null, key)}
                  style={style}>
                {children}
                <div className="pl-canvas-viewport-layer-handles">
                  {handles}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Canvas;
