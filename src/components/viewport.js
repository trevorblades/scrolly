const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const classNames = require('classnames');

const {addImageLayer, setLayerProperties} = require('../actions');
const {ASSET_DRAG_TYPE} = require('../constants');
const isDragTypeFound = require('../util/is-drag-type-found');

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

let Viewport = React.createClass({

  propTypes: {
    assets: React.PropTypes.array.isRequired,
    compositionHeight: React.PropTypes.number.isRequired,
    compositionWidth: React.PropTypes.number.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    layers: React.PropTypes.array.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selectLayer: React.PropTypes.func.isRequired,
    selectedLayerId: React.PropTypes.number,
    wrapperHeight: React.PropTypes.number.isRequired,
    wrapperWidth: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    const dimensions = getViewportDimensions(this.props);
    return Object.assign(dimensions, {
      editingLayerId: null,
      moveX: null,
      moveY: null,
      movingLayerId: null,
      resizeFontSize: null,
      resizeY: null,
      resizingLayerId: null
    });
  },

  componentWillMount: function() {
    this._dragCounter = 0;
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.compositionHeight !== this.props.compositionHeight ||
        nextProps.compositionWidth !== this.props.compositionWidth ||
        nextProps.wrapperHeight !== this.props.wrapperHeight ||
        nextProps.wrapperWidth !== this.props.wrapperWidth) {
      this.setState(getViewportDimensions(nextProps));
    }
  },

  _onClick: function() {
    if (this.props.selectedLayerId !== null) {
      this.props.selectLayer(null);
    }
  },

  _onDragEnter: function(event) {
    event.preventDefault();
    if (isDragTypeFound(event, ASSET_DRAG_TYPE)) {
      this._dragCounter++;
      this.setState({dragging: true});
    }
  },

  _onDragLeave: function(event) {
    if (isDragTypeFound(event, ASSET_DRAG_TYPE)) {
      this._dragCounter--;
      if (!this._dragCounter) {
        this.setState({dragging: false});
      }
    }
  },

  _onDragOver: function(event) {
    event.preventDefault();
  },

  _onDrop: function(event) {
    event.preventDefault();
    const id = event.dataTransfer.getData(ASSET_DRAG_TYPE);
    if (id) {
      const asset = this.props.assets.find(asset => asset.id === parseInt(id));
      this.props.dispatch(addImageLayer(asset.data, asset.width, asset.height));
      this._dragCounter = 0;
      this.setState({dragging: false});
    }
  },

  _onLayerMouseDown: function(layer, event) {
    if (event.button === 0) {
      event.preventDefault();

      if (layer.id !== this.props.selectedLayerId) {
        this.props.selectLayer(layer.id);
      }

      this.setState({
        moveX: layer.x,
        moveY: layer.y,
        movingLayerId: layer.id
      });

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      this._boundLayerMouseMove = this._onLayerMouseMove.bind(null, offsetX, offsetY);
      document.addEventListener('mousemove', this._boundLayerMouseMove);
      document.addEventListener('mouseup', this._onLayerMouseUp);
    }
  },

  _onLayerMouseMove: function(offsetX, offsetY, event) {
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
      moveX: layerX * scale,
      moveY: layerY * scale
    });
  },

  _onLayerMouseUp: function() {
    this.props.dispatch(setLayerProperties(this.state.movingLayerId, {
      x: this.state.moveX,
      y: this.state.moveY
    }));
    this.setState({movingLayerId: null});
    document.removeEventListener('mousemove', this._boundLayerMouseMove);
    document.removeEventListener('mouseup', this._onLayerMouseUp);
    delete this._boundLayerMouseMove;
  },

  _onLayerHandleMouseDown: function(layer, index, event) {
    if (event.button === 0) {
      event.stopPropagation();
      this.setState({
        resizeFontSize: layer.fontSize,
        resizeY: layer.y,
        resizingLayerId: layer.id
      });
      this._boundLayerHandleMouseMove = this._onLayerHandleMouseMove.bind(null, index);
      document.addEventListener('mousemove', this._boundLayerHandleMouseMove);
      document.addEventListener('mouseup', this._onLayerHandleMouseUp);
    }
  },

  _onLayerHandleMouseMove: function(index, event) {
    let layerY = this.state.resizeY;
    let movementY = event.movementY;
    if (index <= 2) {
      const scale = this.props.compositionWidth / this.state.width;
      layerY += event.movementY * scale;
      movementY *= -1;
    }
    return this.setState({
      resizeY: layerY,
      resizeFontSize: Math.round(this.state.resizeFontSize + movementY)
    });
  },

  _onLayerHandleMouseUp: function() {
    this.props.dispatch(setLayerProperties(this.state.resizingLayerId, {
      y: this.state.resizeY,
      fontSize: this.state.resizeFontSize
    }));
    this.setState({resizingLayerId: null});

    document.removeEventListener('mousemove', this._boundLayerHandleMouseMove);
    document.removeEventListener('mouseup', this._onLayerHandleMouseUp);
    delete this._boundLayerHandleMouseMove;
  },

  _onTextLayerBlur: function(event) {
    this.props.dispatch(setLayerProperties(this.state.editingLayerId, {
      value: event.target.innerHTML
    }));
    this.setState({editingLayerId: null}, this.props.selectLayer);
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

  render: function() {
    const viewportClassName = classNames('pl-viewport', {
      'pl-dragging': this.state.dragging
    });
    return (
      <div className={viewportClassName}
          onClick={this._onClick}
          onDragEnter={this._onDragEnter}
          onDragLeave={this._onDragLeave}
          onDragOver={this._onDragOver}
          onDrop={this._onDrop}
          style={{
            width: this.state.width,
            height: this.state.height
          }}>
        {this.props.layers.map(layer => {
          if (layer.in > this.props.percentPlayed ||
              layer.out < this.props.percentPlayed) {
            return null;
          }

          let children;
          const isResizing = layer.id === this.state.resizingLayerId;

          let layerX = layer.x;
          let layerY = layer.y;
          if (layer.id === this.state.movingLayerId) {
            layerX = this.state.moveX;
            layerY = this.state.moveY;
          } else if (isResizing) {
            layerY = this.state.resizeY;
          }

          const style = {
            top: this.state.height * layerY / this.props.compositionHeight,
            left: this.state.width * layerX / this.props.compositionWidth
          };

          switch (layer.type) {
            case 'text':
              var fontSize = isResizing ?
                  this.state.resizeFontSize : layer.fontSize;
              style.fontSize = `${fontSize}px`;
              style.fontWeight = layer.fontWeight;
              style.fontStyle = layer.fontStyle;

              var isEditing = layer.id === this.state.editingLayerId;
              children = (
                <div className="pl-viewport-layer-text"
                    contentEditable={isEditing}
                    dangerouslySetInnerHTML={{__html: layer.value}}
                    onBlur={isEditing && this._onTextLayerBlur}
                    onDoubleClick={this._onTextLayerDoubleClick.bind(null, layer.id)}
                    spellCheck={false}/>
              );
              break;
            case 'image':
              children = (
                <img height={layer.height}
                    src={layer.src}
                    width={layer.width}/>
              );
              break;
            default:
              break;
          }

          const handles = [];
          for (let i = 0; i < 8; i++) {
            handles.push(
              <div className="pl-viewport-layer-handle"
                  key={i}
                  onMouseDown={this._onLayerHandleMouseDown.bind(null, layer, i)}/>
            );
          }

          const layerClassName = classNames('pl-viewport-layer', {
            'pl-selected': layer.id === this.props.selectedLayerId
          });

          return (
            <div className={layerClassName}
                key={layer.id}
                onClick={event => event.stopPropagation()}
                onMouseDown={this._onLayerMouseDown.bind(null, layer)}
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

module.exports = connect(function(state) {
  return {
    assets: state.assets.present,
    layers: state.layers.present.filter(layer => layer.visible)
  };
})(Viewport);
