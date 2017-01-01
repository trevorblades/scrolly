const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const classNames = require('classnames');

const TextField = require('./text-field');

const {setLayerProperties, selectLayer} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const layerPropType = require('../util/layer-prop-type');

function getLinkedPosition(child, parent, parentOffset, parentScale) {
  return parent + (child - parentOffset) * parentScale;
}

function getUnlinkedPosition(layer, parent, parentOffset, parentScale) {
  return (layer - parent) / parentScale + parentOffset;
}

const ViewportLayer = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    getInterpolatedValue: React.PropTypes.func.isRequired,
    layer: layerPropType.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    parent: React.PropTypes.object,
    percentPlayed: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool.isRequired,
    viewportHeight: React.PropTypes.number.isRequired,
    viewportOffsetLeft: React.PropTypes.number.isRequired,
    viewportOffsetTop: React.PropTypes.number.isRequired,
    viewportScale: React.PropTypes.number.isRequired,
    viewportWidth: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      moveX: null,
      moveY: null,
      moving: false,
      resizeScale: null,
      resizing: false
    };
  },

  _onClick: function(event) {
    event.stopPropagation();
  },

  _onMouseDown: function(event) {
    if (event.button === 0) {
      event.stopPropagation();

      if (!this.props.selected) {
        this.props.dispatch(selectLayer(this.props.layer.id));
      }

      const offsetX = event.clientX - this.props.viewportOffsetLeft - event.currentTarget.offsetLeft;
      const offsetY = event.clientY - this.props.viewportOffsetTop - event.currentTarget.offsetTop;
      this._boundMouseMove = this._onMouseMove.bind(null, offsetX, offsetY);
      document.addEventListener('mousemove', this._boundMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);

      this.setState({
        moveX: event.currentTarget.offsetLeft / this.props.viewportScale,
        moveY: event.currentTarget.offsetTop / this.props.viewportScale,
        moving: true
      });
    }
  },

  _onMouseMove: function(offsetX, offsetY, event) {
    let layerX = event.clientX - this.props.viewportOffsetLeft - offsetX;
    const minX = offsetX * -1;
    const maxX = this.props.viewportWidth - offsetX;
    if (layerX < minX) {
      layerX = minX;
    } else if (layerX > maxX) {
      layerX = maxX;
    }

    let layerY = event.clientY - this.props.viewportOffsetTop - offsetY;
    const minY = offsetY * -1;
    const maxY = this.props.viewportHeight - offsetY;
    if (layerY < minY) {
      layerY = minY;
    } else if (layerY > maxY) {
      layerY = maxY;
    }

    this.setState({
      moveX: layerX / this.props.viewportScale,
      moveY: layerY / this.props.viewportScale
    });
  },

  _onMouseUp: function() {
    let layerX = this.state.moveX;
    let layerY = this.state.moveY;
    const properties = {};
    if (this.props.layer.parent !== null) {
      const parentX = this.props.getInterpolatedValue(this.props.parent.x);
      const parentY = this.props.getInterpolatedValue(this.props.parent.y);
      const parentScale = this._getParentScale();
      layerX = getUnlinkedPosition(layerX, parentX, this.props.layer.parent.offsetX, parentScale);
      layerY = getUnlinkedPosition(layerY, parentY, this.props.layer.parent.offsetY, parentScale);
    }
    properties.x = typeof this.props.layer.x === 'object' ?
        Object.assign({}, this.props.layer.x, {
          [this.props.percentPlayed]: layerX
        }) : layerX;
    properties.y = typeof this.props.layer.y === 'object' ?
        Object.assign({}, this.props.layer.y, {
          [this.props.percentPlayed]: layerY
        }) : layerY;
    this.props.onPropertiesChange(properties);

    document.removeEventListener('mousemove', this._boundMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    delete this._boundMouseMove;

    this.setState({
      moveX: null,
      moveY: null,
      moving: false
    });
  },

  _onHandleMouseDown: function(index, event) {
    event.preventDefault();
    if (event.button === 0) {
      event.stopPropagation();

      const node = ReactDOM.findDOMNode(this);
      const width = node.offsetWidth / this.props.layer.scale;
      const height = node.offsetHeight / this.props.layer.scale;
      const handleX = Number(index === 1 || index === 2);
      const handleY = Number(index > 1);
      const originX = this.props.viewportOffsetLeft + node.offsetLeft -
          width * this.props.layer.anchorX +
          width * handleX;
      const originY = this.props.viewportOffsetTop + node.offsetTop -
          height * this.props.layer.anchorY +
          height * handleY;
      this._boundHandleMouseMove = this._onHandleMouseMove.bind(
        null,
        width,
        height,
        originX,
        originY,
        handleX - this.props.layer.anchorX,
        handleY - this.props.layer.anchorY
      );
      document.addEventListener('mousemove', this._boundHandleMouseMove);
      document.addEventListener('mouseup', this._onHandleMouseUp);

      this.setState({
        resizeScale: this.props.layer.scale,
        resizing: true
      });
    }
  },

  _onHandleMouseMove: function(width, height, originX, originY, scaleFactorX, scaleFactorY, event) {
    if (scaleFactorX || scaleFactorY) {
      const deltaX = event.clientX - originX;
      const deltaY = event.clientY - originY;
      const scaleX = scaleFactorX && (width + deltaX / scaleFactorX) / width;
      const scaleY = scaleFactorY && (height + deltaY / scaleFactorY) / height;
      this.setState({resizeScale: Math.max(scaleX, scaleY)});
    }
  },

  _onHandleMouseUp: function() {
    this.props.onPropertiesChange({
      scale: typeof this.props.layer.scale === 'object' ?
          Object.assign({}, this.props.layer.scale, {
            [this.props.percentPlayed]: this.state.resizeScale
          }) :
          this.state.resizeScale
    });

    document.removeEventListener('mousemove', this._boundHandleMouseMove);
    document.removeEventListener('mouseup', this._onHandleMouseUp);
    delete this._boundHandleMouseMove;

    this.setState({
      resizeScale: null,
      resizing: false
    });
  },

  _onTextChange: function(value) {
    this.props.onPropertiesChange({value: value});
    this.props.dispatch(selectLayer(null));
  },

  _getParentScale: function() {
    return this.props.getInterpolatedValue(this.props.parent.scale) /
        this.props.layer.parent.offsetScale;
  },

  render: function() {
    let layerX = this.state.moving ? this.state.moveX :
        this.props.getInterpolatedValue(this.props.layer.x);
    let layerY = this.state.moving ? this.state.moveY :
        this.props.getInterpolatedValue(this.props.layer.y);
    let layerScale = this.state.resizing ? this.state.resizeScale :
        this.props.getInterpolatedValue(this.props.layer.scale);
    if (this.props.layer.parent !== null) {
      const parentScale = this._getParentScale();
      layerScale *= parentScale;
      if (!this.state.moving) {
        const parentX = this.props.getInterpolatedValue(this.props.parent.x);
        const parentY = this.props.getInterpolatedValue(this.props.parent.y);
        layerX = getLinkedPosition(layerX, parentX, this.props.layer.parent.offsetX, parentScale);
        layerY = getLinkedPosition(layerY, parentY, this.props.layer.parent.offsetY, parentScale);
      }
    }

    const style = {
      top: layerY * this.props.viewportScale,
      left: layerX * this.props.viewportScale,
      transform: `translate(${this.props.layer.anchorX * -100}%, ${this.props.layer.anchorY * -100}%)`
    };

    let children;
    switch (this.props.layer.type) {
      case 'text':
        children = (
          <TextField onChange={this._onTextChange}
              style={{
                fontSize: `${this.props.layer.fontSize * layerScale}px`,
                fontWeight: this.props.layer.fontWeight,
                fontStyle: this.props.layer.fontStyle,
                color: this.props.layer.fontColor,
                opacity: this.props.layer.opacity
              }}
              value={this.props.layer.value}/>
        );
        break;
      case 'image':
        children = (
          <img height={this.props.layer.height * this.props.viewportScale * layerScale}
              src={this.props.layer.src}
              style={{opacity: this.props.layer.opacity}}
              width={this.props.layer.width * this.props.viewportScale * layerScale}/>
        );
        break;
      default:
        break;
    }

    const handles = [];
    for (let i = 0; i < 4; i++) {
      handles.push(
        <div className="sv-viewport-layer-handle"
            key={i}
            onMouseDown={this._onHandleMouseDown.bind(null, i)}/>
      );
    }

    const layerClassName = classNames('sv-viewport-layer', {
      'sv-selected': this.props.selected
    });

    return (
      <div className={layerClassName}
          key={this.props.layer.id}
          onClick={this._onClick}
          onMouseDown={this._onMouseDown}
          style={style}
          type={this.props.layer.type}>
        {children}
        <div className="sv-viewport-layer-borders">
          {handles.map(function(handle, index) {
            return <div className="sv-viewport-layer-border" key={index}/>;
          })}
        </div>
        <div className="sv-viewport-layer-anchor" style={{
          top: `${this.props.layer.anchorY * 100}%`,
          left: `${this.props.layer.anchorX * 100}%`
        }}/>
        <div className="sv-viewport-layer-handles">
          {handles}
        </div>
      </div>
    );
  }
});

module.exports = connect(null, function(dispatch, props) {
  return {
    dispatch,
    getInterpolatedValue: function(value) {
      return getInterpolatedValue(value, props.percentPlayed);
    },
    onPropertiesChange: function(properties) {
      dispatch(setLayerProperties(props.layer.id, properties));
    }
  };
})(ViewportLayer);
