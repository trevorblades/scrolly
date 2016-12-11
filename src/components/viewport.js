const React = require('react');
const ReactDOM = require('react-dom');
const classNames = require('classnames');

function getViewportDimensions(options) {
  const compositionAspectRatio = options.compositionWidth / options.compositionHeight;
  const outerAspectRatio = options.wrapperWidth / options.wrapperHeight;

  let height = options.wrapperHeight;
  let width = options.wrapperWidth;
  if (compositionAspectRatio > outerAspectRatio) {
    height = options.wrapperWidth / compositionAspectRatio;
  } else {
    width = options.wrapperHeight * compositionAspectRatio;
  }
  return {
    height: height,
    width: width
  };
}

const Viewport = React.createClass({

  propTypes: {
    compositionHeight: React.PropTypes.number,
    compositionWidth: React.PropTypes.number,
    layers: React.PropTypes.object,
    onLayerChange: React.PropTypes.func,
    percentPlayed: React.PropTypes.number,
    selectLayer: React.PropTypes.func,
    selectedLayer: React.PropTypes.string,
    wrapperHeight: React.PropTypes.number,
    wrapperWidth: React.PropTypes.number
  },

  getInitialState: function() {
    const dimensions = getViewportDimensions(this.props);
    return Object.assign(dimensions, {
      editingLayer: null,
      movingLayer: null,
      movingLayerX: null,
      movingLayerY: null,
      resizingLayerFontSize: null,
      resizingLayer: null,
      resizingLayerY: null
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.compositionHeight !== this.props.compositionHeight ||
        nextProps.compositionWidth !== this.props.compositionWidth ||
        nextProps.wrapperHeight !== this.props.wrapperHeight ||
        nextProps.wrapperWidth !== this.props.wrapperWidth) {
      this.setState(getViewportDimensions(nextProps));
    }
  },

  _onViewportClick: function() {
    if (this.props.selectedLayer) {
      this.props.selectLayer(null);
    }
  },

  _onLayerClick: function(event) {
    event.stopPropagation();
  },

  _onLayerMouseDown: function(id, event) {
    if (id !== this.props.selectedLayer) {
      this.props.selectLayer(id);
    }

    if (!this._boundLayerMouseMove) {
      const layerRect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - layerRect.left;
      const offsetY = event.clientY - layerRect.top;
      const layer = this.props.layers[id];
      this.setState({
        movingLayer: id,
        movingLayerX: layer.x,
        movingLayerY: layer.y
      });
      this._boundLayerMouseMove = this._onLayerMouseMove.bind(null, id, offsetX, offsetY);
      document.addEventListener('mousemove', this._boundLayerMouseMove);
      document.addEventListener('mouseup', this._onLayerMouseUp);
    }
  },

  _onLayerMouseMove: function(id, offsetX, offsetY, event) {
    const node = ReactDOM.findDOMNode(this);
    const scale = this.props.compositionWidth / this.state.width;

    let layerX = event.clientX - node.offsetLeft - offsetX;
    const minX = offsetX * -1;
    const maxX = this.state.width - offsetX;
    if (layerX < minX) {
      layerX = minX;
    } else if (layerX > maxX) {
      layerX = maxX;
    }

    let layerY = event.clientY - node.offsetTop - offsetY;
    const minY = offsetY * -1;
    const maxY = this.state.height - offsetY;
    if (layerY < minY) {
      layerY = minY;
    } else if (layerY > maxY) {
      layerY = maxY;
    }

    this.setState({
      movingLayerX: layerX * scale,
      movingLayerY: layerY * scale
    });
  },

  _onLayerMouseUp: function() {
    if (this.state.movingLayer) {
      this.props.onLayerChange(this.state.movingLayer, {
        x: this.state.movingLayerX,
        y: this.state.movingLayerY
      });
      this.setState({movingLayer: null});
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
        resizingLayer: id,
        resizingLayerY: layer.y
      });
      this._boundLayerHandleMouseMove = this._onLayerHandleMouseMove.bind(null, index);
      document.addEventListener('mousemove', this._boundLayerHandleMouseMove);
      document.addEventListener('mouseup', this._onLayerHandleMouseUp);
    }
  },

  _onLayerHandleMouseMove: function(index, event) {
    const layer = this.props.layers[this.state.resizingLayer];
    if (layer.type === 'text') {
      let layerY = this.state.resizingLayerY;
      let movementY = event.movementY;
      if (index <= 2) {
        const scale = this.props.compositionWidth / this.state.width;
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
    if (this.state.resizingLayer) {
      this.props.onLayerChange(this.state.resizingLayer, {
        y: this.state.resizingLayerY,
        fontSize: this.state.resizingLayerFontSize
      });
      this.setState({resizingLayer: null});
    }
    document.removeEventListener('mousemove', this._boundLayerHandleMouseMove);
    document.removeEventListener('mouseup', this._onLayerHandleMouseUp);
    delete this._boundLayerHandleMouseMove;
  },

  _onTextLayerBlur: function(event) {
    this.props.onLayerChange(this.props.selectedLayer, {value: event.target.innerHTML});
    this.setState({editingLayer: null}, this.props.selectLayer);
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

  render: function() {
    return (
      <div className="pl-viewport"
          onClick={this._onViewportClick}
          style={{
            width: this.state.width,
            height: this.state.height
          }}>
        {Object.keys(this.props.layers).map(id => {
          const layer = this.props.layers[id];
          if (layer.in > this.props.percentPlayed ||
              layer.out < this.props.percentPlayed) {
            return null;
          }

          const isResizing = id === this.state.resizingLayer;
          let children;
          let layerX = layer.x;
          let layerY = layer.y;
          if (id === this.state.movingLayer) {
            layerX = this.state.movingLayerX;
            layerY = this.state.movingLayerY;
          } else if (isResizing) {
            layerY = this.state.resizingLayerY;
          }
          const style = {
            top: this.state.height * layerY / this.props.compositionHeight,
            left: this.state.width * layerX / this.props.compositionWidth
          };

          if (layer.type === 'text') {
            style.fontSize = isResizing ?
                this.state.resizingLayerFontSize :
                layer.fontSize;
            style.fontWeight = layer.fontWeight;
            style.fontStyle = layer.fontStyle;

            const isEditing = id === this.state.editingLayer;
            children = (
              <div className="pl-viewport-layer-text"
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
              <div className="pl-viewport-layer-handle"
                  key={i}
                  onMouseDown={this._onLayerHandleMouseDown.bind(null, id, i)}/>
            );
          }

          const layerClassName = classNames('pl-viewport-layer', {
            'pl-selected': id === this.props.selectedLayer
          });

          return (
            <div className={layerClassName}
                key={id}
                onClick={this._onLayerClick}
                onMouseDown={this._onLayerMouseDown.bind(null, id)}
                style={style}>
              {children}
              <div className="pl-viewport-layer-handles">
                {handles}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
});

module.exports = Viewport;
