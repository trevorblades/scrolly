import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import sentenceCase from 'sentence-case';

import Control from './control';
import Icon from './icon';
import TextField from './text-field';

import {
  copyLayer,
  removeLayer,
  setLayerProperties,
  toggleLayerVisibility,
  linkLayers,
  selectLayer,
  setPercentPlayed
} from '../actions';
import getInterpolatedValue from '../util/get-interpolated-value';
import layerPropType from '../util/layer-prop-type';
import properties from '../util/properties';
import shouldSnap from '../util/should-snap';

const KEYFRAME_CLASS_NAME = 'sv-timeline-layer-property-keyframe';

function clamp(key, value) {
  const property = properties[key];
  if (typeof property.min !== 'undefined' && value < property.min) {
    return property.min;
  } else if (typeof property.max !== 'undefined' && value > property.max) {
    return property.max;
  }
  return value;
}

const TimelineLayer = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    getInterpolatedValue: PropTypes.func.isRequired,
    layer: layerPropType.isRequired,
    layers: PropTypes.arrayOf(layerPropType).isRequired,
    linkable: PropTypes.bool.isRequired,
    onCopyClick: PropTypes.func.isRequired,
    onDragEnd: PropTypes.func.isRequired,
    onDragOver: PropTypes.func.isRequired,
    onDragStart: PropTypes.func.isRequired,
    onLinkClick: PropTypes.func.isRequired,
    onLinkTargetClick: PropTypes.func.isRequired,
    onPropertiesChange: PropTypes.func.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    onVisiblityToggle: PropTypes.func.isRequired,
    parent: PropTypes.object,
    percentPlayed: PropTypes.number.isRequired,
    selected: PropTypes.bool.isRequired,
    selectLayer: PropTypes.func.isRequired,
    setPercentPlayed: PropTypes.func.isRequired,
    sticky: PropTypes.bool.isRequired,
    stuck: PropTypes.bool.isRequired,
    unlinkable: PropTypes.bool
  },

  getInitialState() {
    return {
      dragIn: null,
      dragOut: null,
      dragging: false,
      expanded: false,
      keyframeDragKey: null,
      keyframeDragProperty: null,
      keyframeDragPosition: null,
      selectedKeyframeKey: null,
      selectedKeyframeProperty: null
    };
  },

  componentWillMount() {
    this.keys = Object.keys(properties).filter(
      key => typeof this.props.layer[key] !== 'undefined'
    );
    window.addEventListener('keydown', this.onKeyDown);
    document.body.addEventListener('click', this.onBodyClick);
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    document.body.removeEventListener('click', this.onBodyClick);
  },

  onKeyDown(event) {
    // backspace or delete key pressed when a keyframe is selected
    if (
      (event.keyCode === 8 || event.keyCode === 46) &&
      this.state.selectedKeyframeKey &&
      this.state.selectedKeyframeProperty
    ) {
      this.removeKeyframe(this.state.selectedKeyframeProperty);
    }
  },

  onBodyClick(event) {
    if (event.target.classList[0] !== KEYFRAME_CLASS_NAME) {
      this.setState({
        selectedKeyframeKey: null,
        selectedKeyframeProperty: null
      });
    }
  },

  onBarMouseDown(event) {
    if (event.button === 0) {
      if (!this.props.selected) {
        this.props.selectLayer(event);
      }

      this.setState({
        dragIn: this.props.layer.in,
        dragOut: this.props.layer.out,
        dragging: true
      });

      const offsetX =
        event.clientX - (event.target.offsetLeft + this.refs.track.offsetLeft);
      this.boundBarMouseMove = this.onBarMouseMove.bind(null, offsetX);
      document.addEventListener('mousemove', this.boundBarMouseMove);
      document.addEventListener('mouseup', this.onBarMouseUp);
    }
  },

  onBarMouseMove(offsetX, event) {
    const barSize = this.state.dragOut - this.state.dragIn;
    let dragIn = this.getTrackPosition(event.clientX - offsetX, event.shiftKey);
    let dragOut = dragIn + barSize;

    let changed = false;
    if (event.shiftKey && shouldSnap(dragOut, this.props.percentPlayed)) {
      dragOut = this.props.percentPlayed;
      changed = true;
    } else if (dragOut > 1) {
      dragOut = 1;
      changed = true;
    }

    if (changed) {
      dragIn = dragOut - barSize;
    }

    this.setState({
      dragIn,
      dragOut
    });
  },

  onBarMouseUp() {
    if (
      this.props.layer.in !== this.state.dragIn ||
      this.props.layer.out !== this.state.dragOut
    ) {
      const nextProperties = {
        in: this.state.dragIn,
        out: this.state.dragOut
      };
      const delta = this.state.dragIn - this.props.layer.in;
      Object.keys(this.props.layer).forEach(key => {
        if (key !== 'parent') {
          const property = this.props.layer[key];
          if (property && typeof property === 'object') {
            const keyframes = Object.keys(property);
            nextProperties[key] = keyframes.reduce(
              (obj, keyframe) => ({
                ...obj,
                [parseFloat(keyframe) + delta]: property[keyframe]
              }),
              {}
            );
          }
        }
      });
      this.props.onPropertiesChange(nextProperties);
    }
    this.setState({dragging: false});
    document.removeEventListener('mousemove', this.boundBarMouseMove);
    document.removeEventListener('mouseup', this.onBarMouseUp);
    delete this.boundBarMouseMove;
  },

  onBarHandleMouseDown(event, index) {
    if (event.button === 0) {
      event.stopPropagation();
      this.setState({
        dragIn: this.props.layer.in,
        dragOut: this.props.layer.out,
        dragging: true
      });
      this.boundBarHandleMouseMove = ev => this.onBarHandleMouseMove(ev, index);
      document.addEventListener('mousemove', this.boundBarHandleMouseMove);
      document.addEventListener('mouseup', this.onBarHandleMouseUp);
    }
  },

  onBarHandleMouseMove(event, index) {
    const position = this.getTrackPosition(event.clientX, event.shiftKey);
    this.setState({[`drag${index ? 'Out' : 'In'}`]: position});
  },

  onBarHandleMouseUp() {
    if (
      this.props.layer.in !== this.state.dragIn ||
      this.props.layer.out !== this.state.dragOut
    ) {
      this.props.onPropertiesChange({
        in: this.state.dragIn,
        out: this.state.dragOut
      });
    }
    this.setState({dragging: false});
    document.removeEventListener('mousemove', this.boundBarHandleMouseMove);
    document.removeEventListener('mouseup', this.onBarHandleMouseUp);
    delete this.boundBarHandleMouseMove;
  },

  onKeyframeMouseDown(event, property, position) {
    if (event.button === 0) {
      const nextState = {
        keyframeDragKey: position,
        keyframeDragProperty: property,
        keyframeDragPosition: position
      };

      if (
        position !== this.state.selectedKeyframeKey ||
        property !== this.state.selectedKeyframeProperty
      ) {
        nextState.selectedKeyframeKey = null;
        nextState.selectedKeyframeProperty = null;
      }

      this.setState(nextState);
      document.addEventListener('mousemove', this.onKeyframeMouseMove);
      document.addEventListener('mouseup', this.onKeyframeMouseUp);
    }
  },

  onKeyframeMouseMove(event) {
    const position = this.getTrackPosition(event.clientX, event.shiftKey);
    this.setState({keyframeDragPosition: position});
  },

  onKeyframeMouseUp() {
    const nextState = {
      keyframeDragKey: null,
      keyframeDragProperty: null,
      keyframeDragPosition: null
    };

    if (
      this.state.keyframeDragKey !== this.state.keyframeDragPosition.toString()
    ) {
      const value = this.props.layer[this.state.keyframeDragProperty];
      const nextValue = {
        ...value,
        ...{
          [this.state.keyframeDragPosition]: value[this.state.keyframeDragKey]
        }
      };
      delete nextValue[this.state.keyframeDragKey];

      this.props.onPropertiesChange({
        [this.state.keyframeDragProperty]: nextValue
      });
    } else {
      nextState.selectedKeyframeKey = this.state.keyframeDragKey;
      nextState.selectedKeyframeProperty = this.state.keyframeDragProperty;
      this.props.setPercentPlayed(parseFloat(this.state.keyframeDragKey));
    }

    this.setState(nextState);
    document.removeEventListener('mousemove', this.onKeyframeMouseMove);
    document.removeEventListener('mouseup', this.onKeyframeMouseUp);
  },

  onMoreClick() {
    this.setState({expanded: !this.state.expanded});
  },

  onNameChange(value) {
    this.props.onPropertiesChange({name: value});
  },

  onPropertyChange(key, value) {
    const currentValue = this.props.layer[key];
    const clampedValue = clamp(key, value);
    const nextValue = typeof currentValue === 'object'
      ? {
          ...currentValue,
          ...{
            [this.props.percentPlayed]: clampedValue
          }
        }
      : clampedValue;
    this.props.onPropertiesChange({[key]: nextValue});
  },

  onUnlinkClick(event) {
    event.stopPropagation();
    this.props.dispatch(linkLayers(this.props.layer.id, null));
  },

  addKeyframe(property) {
    let nextValue;
    const value = this.props.layer[property];
    if (typeof value === 'object') {
      const interpolatedValue = this.props.getInterpolatedValue(value);
      nextValue = {
        ...value,
        ...{
          [this.props.percentPlayed]: interpolatedValue
        }
      };
    } else {
      nextValue = {[this.props.percentPlayed]: value};
    }
    this.props.onPropertiesChange({[property]: nextValue});
  },

  removeKeyframe(property) {
    const value = this.props.layer[property];
    if (this.props.percentPlayed in value) {
      let nextValue;
      if (Object.keys(value).length === 1) {
        nextValue = value[this.props.percentPlayed];
      } else {
        nextValue = {...value};
        delete nextValue[this.props.percentPlayed];
      }
      this.props.onPropertiesChange({[property]: nextValue});
    }
  },

  removeKeyframes(property) {
    const value = this.props.layer[property];
    this.props.onPropertiesChange({
      [property]: this.props.getInterpolatedValue(value)
    });
  },

  getTrackPosition(pos, snap) {
    let position =
      (pos - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    if (position < 0) {
      position = 0;
    } else if (position > 1) {
      position = 1;
    }

    if (snap && shouldSnap(position, this.props.percentPlayed)) {
      position = this.props.percentPlayed;
    }

    return position;
  },

  render() {
    const layerClassName = classNames('sv-timeline-layer', {
      'sv-hidden': !this.props.layer.visible,
      'sv-selected': this.props.selected,
      'sv-sticky': this.state.expanded && this.props.sticky,
      'sv-stuck': this.state.expanded && this.props.stuck
    });

    const handles = [];
    for (let i = 0; i < 2; i += 1) {
      handles.push(
        <div
          key={i.toString()}
          className="sv-timeline-layer-bar-handle"
          onMouseDown={this.onBarHandleMouseDown(event, i)}
        />
      );
    }

    let layerIn = this.props.layer.in;
    let layerOut = this.props.layer.out;
    if (this.state.dragging) {
      layerIn = this.state.dragIn;
      layerOut = this.state.dragOut;
    }

    const linkable = this.props.linkable && !this.props.unlinkable;
    const linkAction = {
      className: classNames('sv-timeline-layer-top-link', {
        'sv-disabled': this.props.unlinkable,
        'sv-enabled': linkable
      })
    };
    if (linkable) {
      linkAction.content = <Icon name="target" />;
      linkAction.onClick = this.props.onLinkTargetClick;
      linkAction.title = 'Link to this layer';
    } else if (!this.props.layer.parent) {
      linkAction.content = <Icon name="link" />;
      if (this.props.layers.length > 1) {
        linkAction.onClick = this.props.onLinkClick;
        linkAction.title = 'Link Layer';
      }
    } else {
      linkAction.content = (
        <div>
          <span>{this.props.parent.name}</span>
          <Icon className="sv-active" name="link" />
        </div>
      );
      if (!this.props.unlinkable) {
        linkAction.onClick = this.onUnlinkClick;
        linkAction.title = `Linked to ${this.props.parent.name}`;
      }
    }

    const topActions = [
      linkAction,
      {
        content: (
          <Icon
            className={this.state.expanded ? 'sv-active' : null}
            name="more"
          />
        ),
        onClick: this.onMoreClick,
        title: `${this.state.expanded ? 'Hide' : 'Show'} properties`
      },
      {
        content: (
          <Icon name={this.props.layer.visible ? 'visible' : 'invisible'} />
        ),
        onClick: this.props.onVisiblityToggle,
        title: `${this.props.layer.visible ? 'Hide' : 'Show'} layer`
      },
      {
        content: <Icon name="copy" />,
        onClick: this.props.onCopyClick,
        title: 'Duplicate layer'
      },
      {
        content: <Icon name="trash" />,
        onClick: this.props.onRemoveClick,
        title: 'Remove layer'
      }
    ];

    return (
      <div
        className={layerClassName}
        onDragOver={this.props.onDragOver}
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="sv-timeline-layer-top">
          <Control
            actions={topActions}
            draggable
            onClick={this.props.selectLayer}
            onDragEnd={this.props.onDragEnd}
            onDragStart={this.props.onDragStart}
          >
            <TextField
              onChange={this.onNameChange}
              title={this.props.layer.name}
              value={this.props.layer.name}
            />
          </Control>
          <div
            ref={node => {
              this.track = node;
            }}
            className="sv-timeline-layer-track"
          >
            <div
              className="sv-timeline-layer-top-bar"
              onMouseDown={this.onBarMouseDown}
              style={{
                left: `${layerIn * 100}%`,
                right: `${100 - layerOut * 100}%`
              }}
              type={this.props.layer.type}
            >
              {handles}
            </div>
          </div>
        </div>
        {this.state.expanded &&
          <div className="sv-timeline-layer-properties">
            {this.keys.map(key => {
              const property = properties[key];

              let propertyTrack;
              let value = this.props.layer[key];
              const propertyActions = [];

              if (property.animatable) {
                const animating = typeof value === 'object';
                const highlighted =
                  animating && this.props.percentPlayed in value;
                value = this.props.getInterpolatedValue(value);

                const addKeyframe = () => this.addKeyframe(key);
                propertyActions.push(
                  {
                    id: 'timer',
                    content: (
                      <Icon
                        className={animating ? 'sv-active' : null}
                        name="timer"
                      />
                    ),
                    onClick: animating
                      ? () => this.removeKeyframes(key)
                      : addKeyframe,
                    title: `${animating ? 'Disable' : 'Enable'} animation`
                  },
                  {
                    id: 'add',
                    content: (
                      <Icon
                        className={highlighted ? 'sv-active' : null}
                        name={highlighted ? 'remove' : 'add'}
                      />
                    ),
                    onClick: highlighted
                      ? () => this.removeKeyframe(key)
                      : addKeyframe,
                    title: `${highlighted ? 'Remove' : 'Add'} keyframe`
                  }
                );

                const keyframes = animating
                  ? Object.keys(this.props.layer[key])
                  : [];
                propertyTrack = (
                  <div className="sv-timeline-layer-track">
                    {keyframes.map(keyframe => {
                      const dragging =
                        key === this.state.keyframeDragProperty &&
                        keyframe === this.state.keyframeDragKey;
                      const position = dragging
                        ? this.state.keyframeDragPosition
                        : keyframe;

                      const keyframeClassName = classNames(
                        KEYFRAME_CLASS_NAME,
                        {
                          'sv-selected': this.state.selectedKeyframeKey ===
                            keyframe &&
                            this.state.selectedKeyframeProperty === key
                        }
                      );

                      return (
                        <div
                          key={keyframe}
                          className={keyframeClassName}
                          onMouseDown={event =>
                            this.onKeyframeMouseDown(event, key, keyframe)}
                          style={{left: `${position * 100}%`}}
                        />
                      );
                    })}
                  </div>
                );
              } else {
                propertyActions.push(
                  {
                    id: 'timer',
                    content: <Icon name="timer" />
                  },
                  {
                    id: 'add',
                    content: <Icon name="add" />
                  }
                );
              }

              if (typeof value === 'number') {
                value = Math.round(value * 100) / 100;
              }

              let propertyField;
              if (!property.mutable) {
                propertyField = <span>{value}</span>;
              } else {
                propertyField = (
                  <TextField
                    max={property.max}
                    min={property.min}
                    onChange={val => this.onPropertyChange(key, val)}
                    step={property.step}
                    type={property.type}
                    value={value}
                  />
                );
              }
              propertyActions.unshift({
                id: 'property',
                content: propertyField
              });

              return (
                <div key={key} className="sv-timeline-layer-property">
                  <Control actions={propertyActions}>
                    {sentenceCase(key)}
                  </Control>
                  {propertyTrack}
                </div>
              );
            })}
          </div>}
      </div>
    );
  }
});

export default connect(null, (dispatch, props) => ({
  dispatch,
  getInterpolatedValue(value) {
    return getInterpolatedValue(value, props.percentPlayed);
  },
  onRemoveClick(event) {
    event.stopPropagation();
    dispatch(removeLayer(props.layer.id));
  },
  onCopyClick(event) {
    event.stopPropagation();
    dispatch(copyLayer(props.layer.id));
  },
  onVisiblityToggle(event) {
    event.stopPropagation();
    dispatch(toggleLayerVisibility(props.layer.id));
  },
  onPropertiesChange(nextProperties) {
    dispatch(setLayerProperties(props.layer.id, nextProperties));
  },
  selectLayer(event) {
    event.stopPropagation();
    dispatch(selectLayer(props.layer.id));
  },
  setPercentPlayed(value) {
    dispatch(setPercentPlayed(value));
  }
}))(TimelineLayer);
