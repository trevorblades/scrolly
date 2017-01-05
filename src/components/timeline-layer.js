const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const sentenceCase = require('sentence-case');

const Control = require('./control');
const Icon = require('./icon');
const TextField = require('./text-field');

const {
  removeLayer,
  setLayerProperties,
  toggleLayerVisibility,
  linkLayers,
  selectLayer
} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const layerPropType = require('../util/layer-prop-type');
const properties = require('../util/properties');
const shouldSnap = require('../util/should-snap');

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
    dispatch: React.PropTypes.func.isRequired,
    getInterpolatedValue: React.PropTypes.func.isRequired,
    layer: layerPropType.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    linkable: React.PropTypes.bool.isRequired,
    onDragEnd: React.PropTypes.func.isRequired,
    onDragOver: React.PropTypes.func.isRequired,
    onDragStart: React.PropTypes.func.isRequired,
    onLinkClick: React.PropTypes.func.isRequired,
    onLinkTargetClick: React.PropTypes.func.isRequired,
    onMouseDown: React.PropTypes.func.isRequired,
    onMouseUp: React.PropTypes.func.isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    onRemoveClick: React.PropTypes.func.isRequired,
    onVisiblityToggle: React.PropTypes.func.isRequired,
    parent: React.PropTypes.object,
    percentPlayed: React.PropTypes.number.isRequired,
    selectLayer: React.PropTypes.func.isRequired,
    selected: React.PropTypes.bool.isRequired,
    sticky: React.PropTypes.bool.isRequired,
    stuck: React.PropTypes.bool.isRequired,
    unlinkable: React.PropTypes.bool
  },

  getInitialState: function() {
    return {
      dragIn: null,
      dragOut: null,
      dragging: false,
      expanded: false,
      keyframeDragKey: null,
      keyframeDragProperty: null,
      keyframeDragPosition: null
    };
  },

  componentWillMount: function() {
    this._keys = Object.keys(properties).filter(key => {
      return typeof this.props.layer[key] !== 'undefined';
    });
  },

  _onBarMouseDown: function(event) {
    if (event.button === 0) {
      if (!this.props.selected) {
        this.props.selectLayer(event);
      }

      this.setState({
        dragIn: this.props.layer.in,
        dragOut: this.props.layer.out,
        dragging: true
      });

      const offsetX = event.clientX -
          (event.target.offsetLeft + this.refs.track.offsetLeft);
      this._boundBarMouseMove = this._onBarMouseMove.bind(null, offsetX);
      document.addEventListener('mousemove', this._boundBarMouseMove);
      document.addEventListener('mouseup', this._onBarMouseUp);
    }
  },

  _onBarMouseMove: function(offsetX, event) {
    const barSize = this.state.dragOut - this.state.dragIn;
    let dragIn = this._getTrackPosition(event.clientX - offsetX, event.shiftKey);
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
      dragIn: dragIn,
      dragOut: dragOut
    });
  },

  _onBarMouseUp: function() {
    this.props.onPropertiesChange({
      in: this.state.dragIn,
      out: this.state.dragOut
    });
    this.setState({dragging: false});
    document.removeEventListener('mousemove', this._boundBarMouseMove);
    document.removeEventListener('mouseup', this._onBarMouseUp);
    delete this._boundBarMouseMove;
  },

  _onBarHandleMouseDown: function(index, event) {
    if (event.button === 0) {
      this.props.onMouseDown(event); // this stops propagation as well
      this.setState({
        dragIn: this.props.layer.in,
        dragOut: this.props.layer.out,
        dragging: true
      });
      this._boundBarHandleMouseMove = this._onBarHandleMouseMove.bind(null, index);
      document.addEventListener('mousemove', this._boundBarHandleMouseMove);
      document.addEventListener('mouseup', this._onBarHandleMouseUp);
    }
  },

  _onBarHandleMouseMove: function(index, event) {
    const position = this._getTrackPosition(event.clientX, event.shiftKey);
    this.setState({[`drag${index ? 'Out' : 'In'}`]: position});
  },

  _onBarHandleMouseUp: function() {
    this.props.onPropertiesChange({
      in: this.state.dragIn,
      out: this.state.dragOut
    });
    this.setState({dragging: false});
    document.removeEventListener('mousemove', this._boundBarHandleMouseMove);
    document.removeEventListener('mouseup', this._onBarHandleMouseUp);
    delete this._boundBarHandleMouseMove;
  },

  _onKeyframeMouseDown: function(key, position, event) {
    if (event.button === 0) {
      this.setState({
        keyframeDragKey: position,
        keyframeDragProperty: key,
        keyframeDragPosition: position
      });
      document.addEventListener('mousemove', this._onKeyframeMouseMove);
      document.addEventListener('mouseup', this._onKeyframeMouseUp);
    }
  },

  _onKeyframeMouseMove: function(event) {
    const position = this._getTrackPosition(event.clientX, event.shiftKey);
    this.setState({keyframeDragPosition: position});
  },

  _onKeyframeMouseUp: function() {
    const value = this.props.layer[this.state.keyframeDragProperty];
    const nextValue = Object.assign({}, value, {
      [this.state.keyframeDragPosition]: value[this.state.keyframeDragKey]
    });
    if (this.state.keyframeDragKey !== this.state.keyframeDragPosition.toString()) {
      delete nextValue[this.state.keyframeDragKey];
    }
    this.props.onPropertiesChange({
      [this.state.keyframeDragProperty]: nextValue
    });

    this.setState({
      keyframeDragKey: null,
      keyframeDragProperty: null,
      keyframeDragPosition: null
    });

    document.removeEventListener('mousemove', this._onKeyframeMouseMove);
    document.removeEventListener('mouseup', this._onKeyframeMouseUp);
  },

  _onMoreClick: function() {
    this.setState({expanded: !this.state.expanded});
  },

  _onNameChange: function(value) {
    this.props.onPropertiesChange({name: value});
  },

  _onPropertyChange: function(key, value) {
    const currentValue = this.props.layer[key];
    const clampedValue = clamp(key, value);
    const nextValue = typeof currentValue === 'object' ?
        Object.assign({}, currentValue, {
          [this.props.percentPlayed]: clampedValue
        }) : clampedValue;
    this.props.onPropertiesChange({[key]: nextValue});
  },

  _onUnlinkClick: function(event) {
    event.stopPropagation();
    this.props.dispatch(linkLayers(this.props.layer.id, null));
  },

  _addKeyframe: function(property) {
    let nextValue;
    const value = this.props.layer[property];
    if (typeof value === 'object') {
      const interpolatedValue = this.props.getInterpolatedValue(value);
      nextValue = Object.assign({}, value, {
        [this.props.percentPlayed]: interpolatedValue
      });
    } else {
      nextValue = {[this.props.percentPlayed]: value};
    }
    this.props.onPropertiesChange({[property]: nextValue});
  },

  _removeKeyframe: function(property) {
    const value = this.props.layer[property];
    if (this.props.percentPlayed in value) {
      let nextValue;
      if (Object.keys(value).length === 1) {
        nextValue = value[this.props.percentPlayed];
      } else {
        nextValue = Object.assign({}, value);
        delete nextValue[this.props.percentPlayed];
      }
      this.props.onPropertiesChange({[property]: nextValue});
    }
  },

  _removeKeyframes: function(property) {
    const value = this.props.layer[property];
    this.props.onPropertiesChange({
      [property]: this.props.getInterpolatedValue(value)
    });
  },

  _getTrackPosition: function(pos, snap) {
    let position = (pos - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
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

  render: function() {
    const layerClassName = classNames('sv-timeline-layer', {
      'sv-hidden': !this.props.layer.visible,
      'sv-selected': this.props.selected,
      'sv-sticky': this.state.expanded && this.props.sticky,
      'sv-stuck': this.state.expanded && this.props.stuck
    });

    const handles = [];
    for (var i = 0; i < 2; i++) {
      handles.push(
        <div className="sv-timeline-layer-bar-handle"
            key={i}
            onMouseDown={this._onBarHandleMouseDown.bind(null, i)}/>
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
      linkAction.content = <Icon name="target"/>;
      linkAction.onClick = this.props.onLinkTargetClick;
      linkAction.title = 'Link to this layer';
    } else {
      if (!this.props.layer.parent) {
        linkAction.content = <Icon name="link"/>;
        if (this.props.layers.length > 1) {
          linkAction.onClick = this.props.onLinkClick;
          linkAction.title = 'Link Layer';
        }
      } else {
        linkAction.content = (
          <div>
            <span>{this.props.parent.name}</span>
            <Icon className="sv-active" name="link"/>
          </div>
        );
        if (!this.props.unlinkable) {
          linkAction.onClick = this._onUnlinkClick;
          linkAction.title = `Linked to ${this.props.parent.name}`;
        }
      }
    }

    const topActions = [
      linkAction,
      {
        content: (
          <Icon className={this.state.expanded ? 'sv-active' : null}
              name="more"/>
        ),
        onClick: this._onMoreClick,
        title: `${this.state.expanded ? 'Hide' : 'Show'} properties`
      },
      {
        content: <Icon name={this.props.layer.visible ? 'visible' : 'invisible'}/>,
        onClick: this.props.onVisiblityToggle,
        title: `${this.props.layer.visible ? 'Hide' : 'Show'} layer`
      },
      {
        content: <Icon name="trash"/>,
        onClick: this.props.onRemoveClick,
        title: 'Remove layer'
      }
    ];

    return (
      <div className={layerClassName}
          onDragOver={this.props.onDragOver}
          onMouseDown={this.props.onMouseDown}
          onMouseUp={this.props.onMouseUp}>
        <div className="sv-timeline-layer-top">
          <Control actions={topActions}
              draggable
              onClick={this.props.selectLayer}
              onDragEnd={this.props.onDragEnd}
              onDragStart={this.props.onDragStart}>
            <TextField onChange={this._onNameChange}
                value={this.props.layer.name}/>
          </Control>
          <div className="sv-timeline-layer-track"
              key={this.props.layer.id}
              ref="track">
            <div className="sv-timeline-layer-top-bar"
                onMouseDown={this._onBarMouseDown}
                style={{
                  left: `${layerIn * 100}%`,
                  right: `${100 - layerOut * 100}%`
                }}
                type={this.props.layer.type}>
              {handles}
            </div>
          </div>
        </div>
        {this.state.expanded &&
          <div className="sv-timeline-layer-properties">
            {this._keys.map(key => {
              const property = properties[key];

              let propertyTrack;
              let value = this.props.layer[key];
              const propertyActions = [];

              if (property.animatable) {
                const animating = typeof value === 'object';
                const highlighted = animating && this.props.percentPlayed in value;
                value = this.props.getInterpolatedValue(value);

                const addKeyframe = this._addKeyframe.bind(null, key);
                propertyActions.push(
                  {
                    content: (
                      <Icon className={animating ? 'sv-active' : null}
                          name="timer"/>
                    ),
                    onClick: animating ?
                        this._removeKeyframes.bind(null, key) : addKeyframe,
                    title: `${animating ? 'Disable' : 'Enable'} animation`
                  },
                  {
                    content: (
                      <Icon className={highlighted ? 'sv-active' : null}
                          name={highlighted ? 'remove' : 'add'}/>
                    ),
                    onClick: highlighted ?
                        this._removeKeyframe.bind(null, key) : addKeyframe,
                    title: `${highlighted ? 'Remove' : 'Add'} keyframe`
                  }
                );

                const keyframes = animating ? Object.keys(this.props.layer[key]) : [];
                propertyTrack = (
                  <div className="sv-timeline-layer-track">
                    {keyframes.map((keyframe, index) => {
                      const dragging = key === this.state.keyframeDragProperty &&
                          keyframe === this.state.keyframeDragKey;
                      const position = dragging ?
                          this.state.keyframeDragPosition : keyframe;
                      return (
                        <div className="sv-timeline-layer-property-keyframe"
                            key={index}
                            onMouseDown={this._onKeyframeMouseDown.bind(null, key, keyframe)}
                            style={{left: `${position * 100}%`}}/>
                      );
                    })}
                  </div>
                );
              } else {
                propertyActions.push({content: <Icon name="timer"/>},
                    {content: <Icon name="add"/>});
              }

              if (typeof value === 'number') {
                value = Math.round(value * 100) / 100;
              }

              let propertyField;
              if (!property.mutable) {
                propertyField = <span>{value}</span>;
              } else {
                propertyField = (
                  <TextField onChange={this._onPropertyChange.bind(null, key)}
                      step={property.step}
                      type={property.type}
                      value={value}/>
                );
              }
              propertyActions.unshift({
                content: propertyField
              });

              return (
                <div className="sv-timeline-layer-property"
                    key={key}>
                  <Control actions={propertyActions}>{sentenceCase(key)}</Control>
                  {propertyTrack}
                </div>
              );
            })}
          </div>}
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
    onRemoveClick: function(event) {
      event.stopPropagation();
      dispatch(removeLayer(props.layer.id));
    },
    onVisiblityToggle: function(event) {
      event.stopPropagation();
      dispatch(toggleLayerVisibility(props.layer.id));
    },
    onPropertiesChange: function(properties) {
      dispatch(setLayerProperties(props.layer.id, properties));
    },
    selectLayer: function(event) {
      event.stopPropagation();
      dispatch(selectLayer(props.layer.id));
    }
  };
})(TimelineLayer);
