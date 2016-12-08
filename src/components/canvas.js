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
      editingLayerId: null,
      movingLayerId: null,
      movingLayerX: null,
      movingLayerY: null,
      resizingLayerFontSize: null,
      resizingLayerId: null,
      resizingLayerY: null,
      selectedLayerId: null
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
    if (this.state.selectedLayerId) {
      this._deselectLayer();
    }
  },

  _onLayerClick: function(id, event) {
    event.stopPropagation();
    if (id !== this.state.selectedLayerId) {
      this.setState({selectedLayerId: id});
      document.addEventListener('keydown', this._onKeyDown);
    }
  },

  _onLayerMouseDown: function(id, event) {
    if (!this._boundLayerMouseMove) {
      const layerRect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - layerRect.left;
      const offsetY = event.clientY - layerRect.top;
      const layer = this.props.layers[id];
      this.setState({
        movingLayerId: id,
        movingLayerX: layer.x,
        movingLayerY: layer.y
      });
      this._boundLayerMouseMove = this._onLayerMouseMove.bind(null, id, offsetX, offsetY);
      document.addEventListener('mousemove', this._boundLayerMouseMove);
      document.addEventListener('mouseup', this._onLayerMouseUp);
    }
  },

  _onLayerMouseMove: function(id, offsetX, offsetY, event) {
    let layerX = event.clientX - this.refs.viewport.offsetLeft - offsetX;
    const minX = offsetX * -1;
    const maxX = this.state.viewportWidth - offsetX;
    if (layerX < minX) {
      layerX = minX;
    } else if (layerX > maxX) {
      layerX = maxX;
    }

    let layerY = event.clientY - this.refs.viewport.offsetTop - offsetY;
    const minY = offsetY * -1;
    const maxY = this.state.viewportHeight - offsetY;
    if (layerY < minY) {
      layerY = minY;
    } else if (layerY > maxY) {
      layerY = maxY;
    }

    const scale = this.props.compositionWidth / this.state.viewportWidth;
    this.setState({
      movingLayerX: layerX * scale,
      movingLayerY: layerY * scale
    });
  },

  _onLayerMouseUp: function() {
    if (this.state.movingLayerId) {
      this.props.onLayerChange(this.state.movingLayerId, {
        x: this.state.movingLayerX,
        y: this.state.movingLayerY
      });
      this.setState({movingLayerId: null});
    }
    document.removeEventListener('mousemove', this._boundLayerMouseMove);
    document.removeEventListener('mouseup', this._onLayerMouseUp);
    delete this._boundLayerMouseMove;
  },

  _onLayerHandleMouseDown: function(id, index, event) {
    event.stopPropagation();
    if (!this._boundLayerHandleMouseMove) {
      const layer = this.props.layers[id];
      this.setState({
        resizingLayerFontSize: layer.fontSize,
        resizingLayerId: id,
        resizingLayerY: layer.y
      });
      this._boundLayerHandleMouseMove = this._onLayerHandleMouseMove.bind(null, index);
      document.addEventListener('mousemove', this._boundLayerHandleMouseMove);
      document.addEventListener('mouseup', this._onLayerHandleMouseUp);
    }
  },

  _onLayerHandleMouseMove: function(index, event) {
    const layer = this.props.layers[this.state.resizingLayerId];
    if (layer.type === 'text') {
      let layerY = this.state.resizingLayerY;
      let movementY = event.movementY;
      if (index <= 2) {
        const scale = this.props.compositionWidth / this.state.viewportWidth;
        layerY += event.movementY * scale;
        movementY *= -1;
      }
      return this.setState({
        resizingLayerY: layerY,
        resizingLayerFontSize: Math.round(this.state.resizingLayerFontSize + movementY)
      });
    }
  },

  _onLayerHandleMouseUp: function() {
    if (this.state.resizingLayerId) {
      this.props.onLayerChange(this.state.resizingLayerId, {
        y: this.state.resizingLayerY,
        fontSize: this.state.resizingLayerFontSize
      });
      this.setState({resizingLayerId: null});
    }
    document.removeEventListener('mousemove', this._boundLayerHandleMouseMove);
    document.removeEventListener('mouseup', this._onLayerHandleMouseUp);
    delete this._boundLayerHandleMouseMove;
  },

  _onTextLayerBlur: function(event) {
    this.props.onLayerChange(this.state.selectedLayerId, {value: event.target.innerHTML});
    this._deselectLayer();
  },

  _onTextLayerDoubleClick: function(id, event) {
    event.stopPropagation();
    const target = event.target;
    if (id !== this.state.editingLayerId) {
      this.setState({editingLayerId: id}, function() {
        target.focus();
        document.execCommand('selectAll', false, null);
      });
    }
  },

  _deselectLayer: function() {
    this.setState({
      editingLayerId: null,
      selectedLayerId: null
    }, this._onLayerMouseUp);
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
          {Object.keys(this.props.layers).map(id => {
            const layer = this.props.layers[id];
            const isResizing = id === this.state.resizingLayerId;

            let children;
            let layerX = layer.x;
            let layerY = layer.y;
            if (id === this.state.movingLayerId) {
              layerX = this.state.movingLayerX;
              layerY = this.state.movingLayerY;
            } else if (isResizing) {
              layerY = this.state.resizingLayerY;
            }
            const style = {
              top: this.state.viewportHeight * layerY / this.props.compositionHeight,
              left: this.state.viewportWidth * layerX / this.props.compositionWidth
            };

            if (layer.type === 'text') {
              style.fontSize = isResizing ?
                  this.state.resizingLayerFontSize :
                  layer.fontSize;
              style.fontWeight = layer.fontWeight;
              style.fontStyle = layer.fontStyle;

              const isEditing = id === this.state.editingLayerId;
              children = (
                <div className="pl-canvas-viewport-layer-text"
                    contentEditable={isEditing}
                    dangerouslySetInnerHTML={{__html: layer.value}}
                    onBlur={isEditing && this._onTextLayerBlur}
                    onDoubleClick={this._onTextLayerDoubleClick.bind(null, id)}
                    spellCheck={false}/>
              );
            }

            const handles = [];
            for (let i = 0; i < 8; i++) {
              handles.push(
                <div className="pl-canvas-viewport-layer-handle"
                    key={i}
                    onMouseDown={this._onLayerHandleMouseDown.bind(null, id, i)}/>
              );
            }

            const layerClassName = classNames('pl-canvas-viewport-layer', {
              'pl-selected': id === this.state.selectedLayerId
            });

            return (
              <div className={layerClassName}
                  key={id}
                  onClick={this._onLayerClick.bind(null, id)}
                  onMouseDown={this._onLayerMouseDown.bind(null, id)}
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
