const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const classNames = require('classnames');

const TextField = require('./text-field');

const {setLayerProperties} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const layerPropType = require('../util/layer-prop-type');
const properties = require('../util/properties');

const ViewportLayer = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layer: layerPropType.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selectLayer: React.PropTypes.func.isRequired,
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
        this.props.selectLayer(this.props.layer.id);
      }

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width * this.props.layer.anchorX;
      const offsetY = event.clientY - rect.top - rect.height * this.props.layer.anchorY;
      this._boundMouseMove = this._onMouseMove.bind(null, offsetX, offsetY);
      document.addEventListener('mousemove', this._boundMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);

      this.setState({
        moveX: getInterpolatedValue(this.props.layer.x, this.props.percentPlayed),
        moveY: getInterpolatedValue(this.props.layer.y, this.props.percentPlayed),
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
      moveX: Math.round(layerX / this.props.viewportScale),
      moveY: Math.round(layerY / this.props.viewportScale)
    });
  },

  _onMouseUp: function() {
    this.props.onPropertiesChange({
      x: typeof this.props.layer.x === 'object' ?
          Object.assign({}, this.props.layer.x, {
            [this.props.percentPlayed]: this.state.moveX
          }) :
          this.state.moveX,
      y: typeof this.props.layer.y === 'object' ?
          Object.assign({}, this.props.layer.y, {
            [this.props.percentPlayed]: this.state.moveY
          }) :
          this.state.moveY
    });

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
    this.props.selectLayer(null);
  },

  render: function() {
    let parentX = properties.x.default;
    let parentY = properties.y.default;
    let parentScale = properties.scale.default;
    if (this.props.layer.parent !== null) {
      const parent = this.props.layers.find(layer => layer.id === this.props.layer.parent);
      parentX = getInterpolatedValue(parent.x, this.props.percentPlayed);
      parentY = getInterpolatedValue(parent.y, this.props.percentPlayed);
      parentScale = getInterpolatedValue(parent.scale, this.props.percentPlayed);
    }

    const layerX = parentX + (this.state.moving ? this.state.moveX :
        getInterpolatedValue(this.props.layer.x, this.props.percentPlayed));
    const layerY = parentY + (this.state.moving ? this.state.moveY :
        getInterpolatedValue(this.props.layer.y, this.props.percentPlayed));
    const layerScale = parentScale * (this.state.resizing ? this.state.resizeScale :
        getInterpolatedValue(this.props.layer.scale, this.props.percentPlayed));

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
        <div className="pl-viewport-layer-handle"
            key={i}
            onMouseDown={this._onHandleMouseDown.bind(null, i)}/>
      );
    }

    const layerClassName = classNames('pl-viewport-layer', {
      'pl-selected': this.props.selected
    });

    return (
      <div className={layerClassName}
          key={this.props.layer.id}
          onClick={this._onClick}
          onMouseDown={this._onMouseDown}
          style={style}>
        {children}
        <div className="pl-viewport-layer-anchor"
            style={{
              top: `${this.props.layer.anchorY * 100}%`,
              left: `${this.props.layer.anchorX * 100}%`
            }}/>
        <div className="pl-viewport-layer-handles">
          {handles}
        </div>
      </div>
    );
  }
});

function mapStateToProps(state) {
  return {
    layers: state.layers.present
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    dispatch,
    onPropertiesChange: function(properties) {
      dispatch(setLayerProperties(props.layer.id, properties));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ViewportLayer);
