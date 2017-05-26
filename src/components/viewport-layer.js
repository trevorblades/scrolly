import React from 'react';
import classNames from 'classnames';

import {SHAPES} from './presets';
import Shape from './shape';
import TextField from './text-field';

import {selectLayer} from '../actions';
import getParentProperties from '../util/get-parent-properties';
import getUnlinkedPosition from '../util/get-unlinked-position';
import layerPropType from '../util/layer-prop-type';

const DUMMY_LAYER_SIZE = 16;

const ViewportLayer = React.createClass({
  propTypes: {
    assets: React.PropTypes.array.isRequired,
    dispatch: React.PropTypes.func,
    getInterpolatedValue: React.PropTypes.func.isRequired,
    hidden: React.PropTypes.bool,
    layer: layerPropType.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    parents: React.PropTypes.array.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    readOnly: React.PropTypes.bool,
    selected: React.PropTypes.bool.isRequired,
    viewportHeight: React.PropTypes.number.isRequired,
    viewportOffsetLeft: React.PropTypes.number.isRequired,
    viewportOffsetTop: React.PropTypes.number.isRequired,
    viewportScale: React.PropTypes.number.isRequired,
    viewportWidth: React.PropTypes.number.isRequired
  },

  getInitialState() {
    return {
      asset: this.getAsset(this.props.layer.asset),
      moveX: null,
      moveY: null,
      moving: false,
      resizeScale: null,
      resizing: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.assets !== this.props.assets ||
      nextProps.layer.asset !== this.props.layer.asset
    ) {
      this.setState({asset: this.getAsset(nextProps.layer.asset)});
    }
  },

  onClick(event) {
    event.stopPropagation();
  },

  onMouseDown(event) {
    if (event.button === 0) {
      event.stopPropagation();

      if (!this.props.selected) {
        this.props.dispatch(selectLayer(this.props.layer.id));
      }

      const offsetX =
        event.clientX -
        this.props.viewportOffsetLeft -
        event.currentTarget.offsetLeft;
      const offsetY =
        event.clientY -
        this.props.viewportOffsetTop -
        event.currentTarget.offsetTop;
      this.boundMouseMove = ev => this.onMouseMove(ev, offsetX, offsetY);
      document.addEventListener('mousemove', this.boundMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);

      this.setState({
        moveX: event.currentTarget.offsetLeft / this.props.viewportScale,
        moveY: event.currentTarget.offsetTop / this.props.viewportScale,
        moving: true
      });
    }
  },

  onMouseMove(event, offsetX, offsetY) {
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

  onMouseUp() {
    let layerX = this.state.moveX;
    let layerY = this.state.moveY;
    if (this.props.parents.length) {
      const parent = getParentProperties(
        this.props.parents,
        this.props.percentPlayed
      );
      const parentScale = parent.scale / this.props.layer.parent.offsetScale;
      layerX = getUnlinkedPosition(
        layerX,
        parent.x,
        parentScale,
        this.props.layer.parent.offsetX
      );
      layerY = getUnlinkedPosition(
        layerY,
        parent.y,
        parentScale,
        this.props.layer.parent.offsetY
      );
    }

    this.props.onPropertiesChange({
      x: typeof this.props.layer.x === 'object'
        ? {
            ...this.props.layer.x,
            ...{
              [this.props.percentPlayed]: layerX
            }
          }
        : layerX,
      y: typeof this.props.layer.y === 'object'
        ? {
            ...this.props.layer.y,
            ...{
              [this.props.percentPlayed]: layerY
            }
          }
        : layerY
    });

    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    delete this.boundMouseMove;

    this.setState({
      moveX: null,
      moveY: null,
      moving: false
    });
  },

  onHandleMouseDown(event, index) {
    event.preventDefault();
    if (event.button === 0) {
      event.stopPropagation();

      const scale = this.props.getInterpolatedValue(this.props.layer.scale);
      const width = this.viewportLayer.offsetWidth / scale;
      const height = this.viewportLayer.offsetHeight / scale;
      const handleX = Number(index === 1 || index === 2);
      const handleY = Number(index > 1);
      const originX =
        this.props.viewportOffsetLeft +
        this.viewportLayer.offsetLeft -
        width * this.props.layer.anchorX +
        width * handleX;
      const originY =
        this.props.viewportOffsetTop +
        this.viewportLayer.offsetTop -
        height * this.props.layer.anchorY +
        height * handleY;
      this.boundHandleMouseMove = this.onHandleMouseMove.bind(
        null,
        width,
        height,
        originX,
        originY,
        handleX - this.props.layer.anchorX,
        handleY - this.props.layer.anchorY
      );
      document.addEventListener('mousemove', this.boundHandleMouseMove);
      document.addEventListener('mouseup', this.onHandleMouseUp);

      this.setState({
        resizeScale: scale,
        resizing: true
      });
    }
  },

  onHandleMouseMove(
    width,
    height,
    originX,
    originY,
    scaleFactorX,
    scaleFactorY,
    event
  ) {
    if (scaleFactorX || scaleFactorY) {
      const deltaX = event.clientX - originX;
      const deltaY = event.clientY - originY;
      const scaleX = scaleFactorX && (width + deltaX / scaleFactorX) / width;
      const scaleY = scaleFactorY && (height + deltaY / scaleFactorY) / height;
      this.setState({resizeScale: Math.max(scaleX, scaleY)});
    }
  },

  onHandleMouseUp() {
    let scale = this.state.resizeScale;
    if (typeof this.props.layer.scale === 'object') {
      scale = {
        ...this.props.layer.scale,
        [this.props.percentPlayed]: this.state.resizeScale
      };
    }
    this.props.onPropertiesChange({scale});

    document.removeEventListener('mousemove', this.boundHandleMouseMove);
    document.removeEventListener('mouseup', this.onHandleMouseUp);
    delete this.boundHandleMouseMove;

    this.setState({
      resizeScale: null,
      resizing: false
    });
  },

  onTextChange(value) {
    this.props.onPropertiesChange({value});
    this.props.dispatch(selectLayer(null));
  },

  getAsset(id) {
    if (typeof id === 'undefined') {
      return null;
    }
    return this.props.assets.find(asset => asset.id === id) || null;
  },

  render() {
    let layerX = this.state.moving
      ? this.state.moveX
      : this.props.getInterpolatedValue(this.props.layer.x);
    let layerY = this.state.moving
      ? this.state.moveY
      : this.props.getInterpolatedValue(this.props.layer.y);
    let layerScale = this.state.resizing
      ? this.state.resizeScale
      : this.props.getInterpolatedValue(this.props.layer.scale);
    const layerRotation = this.props.getInterpolatedValue(
      this.props.layer.rotation
    );
    let layerOpacity = this.props.getInterpolatedValue(
      this.props.layer.opacity
    );
    if (this.props.parents.length) {
      const parent = getParentProperties(
        this.props.parents,
        this.props.percentPlayed
      );
      const parentScale = parent.scale / this.props.layer.parent.offsetScale;
      if (!this.state.moving) {
        layerX =
          parent.x + (layerX - this.props.layer.parent.offsetX) * parentScale;
        layerY =
          parent.y + (layerY - this.props.layer.parent.offsetY) * parentScale;
      }
      layerScale *= parentScale;
      layerOpacity *= parent.opacity;
    }

    const style = {
      top: layerY * this.props.viewportScale,
      left: layerX * this.props.viewportScale,
      transform: `translate(${this.props.layer.anchorX * -100}%, ${this.props.layer.anchorY * -100}%)
          rotate(${layerRotation}deg)`,
      transformOrigin: `${this.props.layer.anchorX * 100}% ${this.props.layer.anchorY * 100}%`
    };

    let content;
    switch (this.props.layer.type) {
      case 'dummy':
        style.width = DUMMY_LAYER_SIZE * layerScale;
        style.height = DUMMY_LAYER_SIZE * layerScale;
        break;
      case 'text':
        content = (
          <TextField
            multiline
            onChange={this.onTextChange}
            style={{
              padding: `${this.props.layer.paddingY * layerScale}px
                    ${this.props.layer.paddingX * layerScale}px`,
              fontSize: `${this.props.layer.fontSize * this.props.viewportScale * layerScale}px`,
              fontWeight: this.props.layer.fontWeight,
              fontStyle: this.props.layer.fontStyle,
              color: this.props.layer.fontColor,
              backgroundColor: this.props.layer.backgroundColor,
              opacity: layerOpacity
            }}
            value={this.props.layer.value}
          />
        );
        break;
      case 'image':
        content = (
          <img
            alt={this.props.layer.name}
            height={
              this.state.asset.height * this.props.viewportScale * layerScale
            }
            src={this.state.asset.src}
            style={{opacity: layerOpacity}}
            width={
              this.state.asset.width * this.props.viewportScale * layerScale
            }
          />
        );
        break;
      case 'shape': {
        const size = 100 * this.props.viewportScale * layerScale;
        content = (
          <Shape
            fill={this.props.layer.fill}
            shape={SHAPES[this.props.layer.shape]}
            size={size}
            stroke={this.props.layer.stroke}
            strokeWidth={this.props.layer.strokeWidth}
            style={{opacity: layerOpacity}}
          />
        );
        break;
      }
      default:
        break;
    }

    let anchor;
    let borders;
    let handles;
    if (!this.props.readOnly) {
      anchor = (
        <div
          className="sv-viewport-layer-anchor"
          style={{
            top: `${this.props.layer.anchorY * 100}%`,
            left: `${this.props.layer.anchorX * 100}%`
          }}
        />
      );

      const sides = [0, 1, 2, 3];
      borders = (
        <div className="sv-viewport-layer-borders">
          {sides.map(side => (
            <div key={side} className="sv-viewport-layer-border" />
          ))}
        </div>
      );
      handles = (
        <div className="sv-viewport-layer-handles">
          {sides.map(side => (
            <div
              key={side}
              className="sv-viewport-layer-handle"
              onMouseDown={event => this.onHandleMouseDown(event, side)}
            />
          ))}
        </div>
      );
    }

    const layerClassName = classNames('sv-viewport-layer', {
      'sv-hidden': this.props.hidden,
      'sv-selected': this.props.selected
    });

    return (
      <div
        ref={node => {
          this.ViewportLayer = node;
        }}
        className={layerClassName}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        style={style}
        type={this.props.layer.type}
      >
        <div className="sv-viewport-layer-content">
          {content}
        </div>
        {borders}
        {anchor}
        {handles}
      </div>
    );
  }
});

export default ViewportLayer;
