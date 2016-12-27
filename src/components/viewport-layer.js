const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const classNames = require('classnames');

const TextField = require('./text-field');

const {setLayerProperties} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const layerPropType = require('../util/layer-prop-type');

const ViewportLayer = React.createClass({

  propTypes: {
    compositionHeight: React.PropTypes.number.isRequired,
    compositionWidth: React.PropTypes.number.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    layer: layerPropType.isRequired,
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

  _onMouseDown: function(event) {
    if (event.button === 0) {
      event.preventDefault();

      if (!this.props.selected) {
        this.props.selectLayer(this.props.layer.id);
      }

      this.setState({
        moveX: getInterpolatedValue(this.props.layer.x, this.props.percentPlayed),
        moveY: getInterpolatedValue(this.props.layer.y, this.props.percentPlayed),
        moving: true
      });

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width * this.props.layer.anchorX;
      const offsetY = event.clientY - rect.top - rect.height * this.props.layer.anchorY;
      this._boundMouseMove = this._onMouseMove.bind(null, offsetX, offsetY);
      document.addEventListener('mousemove', this._boundMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
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
    this.setState({
      moveX: null,
      moveY: null,
      moving: false
    });
    document.removeEventListener('mousemove', this._boundMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    delete this._boundMouseMove;
  },

  _onHandleMouseDown: function(index, event) {
    if (event.button === 0) {
      event.stopPropagation();
      this.setState({
        resizeScale: this.props.layer.scale,
        resizing: true
      });
      const node = ReactDOM.findDOMNode(this);
      this._boundHandleMouseMove = this._onHandleMouseMove.bind(
        null,
        index,
        node.offsetWidth,
        node.offsetHeight,
        event.clientX,
        event.clientY
      );
      document.addEventListener('mousemove', this._boundHandleMouseMove);
      document.addEventListener('mouseup', this._onHandleMouseUp);
    }
  },

  _onHandleMouseMove: function(index, width, height, originX, originY, event) {
    const directionX = index === 1 || index === 2 ? -1 : 1;
    const directionY = index === 2 || index === 3 ? -1 : 1;
    const deltaX = (originX - event.clientX) * directionX;
    const deltaY = (originY - event.clientY) * directionY;
    const scaleX = (width + deltaX) / width;
    const scaleY = (height + deltaY) / height;
    return this.setState({resizeScale: Math.max(scaleX, scaleY)});
  },

  _onHandleMouseUp: function() {
    this.props.onPropertiesChange({
      scale: typeof this.props.layer.scale === 'object' ?
          Object.assign({}, this.props.layer.scale, {
            [this.props.percentPlayed]: this.state.resizeScale
          }) :
          this.state.resizeScale
    });
    this.setState({
      resizeScale: null,
      resizing: false
    });
    document.removeEventListener('mousemove', this._boundHandleMouseMove);
    document.removeEventListener('mouseup', this._onHandleMouseUp);
    delete this._boundHandleMouseMove;
  },

  _onTextChange: function(value) {
    this.props.onPropertiesChange({value: value});
    this.props.selectLayer(null);
  },

  render: function() {
    let layerX = this.state.moving ?
        this.state.moveX :
        getInterpolatedValue(this.props.layer.x, this.props.percentPlayed);
    let layerY = this.state.moving ?
        this.state.moveY :
        getInterpolatedValue(this.props.layer.y, this.props.percentPlayed);
    let layerScale = this.state.resizing ?
        this.state.resizeScale :
        getInterpolatedValue(this.props.layer.scale, this.props.percentPlayed);

    const style = {
      top: this.props.viewportHeight * layerY / this.props.compositionHeight,
      left: this.props.viewportWidth * layerX / this.props.compositionWidth,
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
          onClick={event => event.stopPropagation()}
          onMouseDown={this._onMouseDown}
          style={style}>
        {children}
        <div className="pl-viewport-layer-handles">
          {handles}
        </div>
      </div>
    );
  }
});

module.exports = connect(null, function(dispatch, props) {
  return {
    dispatch,
    onPropertiesChange: function(properties) {
      dispatch(setLayerProperties(props.layer.id, properties));
    }
  };
})(ViewportLayer);
