const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const sentenceCase = require('sentence-case');

const Icon = require('./icon');
const TextField = require('./text-field');

const {removeLayer, setLayerProperties, toggleLayerVisibility} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
const layerPropType = require('../util/layer-prop-type');
const properties = require('../util/properties');

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
    layer: layerPropType.isRequired,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    linkable: React.PropTypes.bool.isRequired,
    onDragEnd: React.PropTypes.func.isRequired,
    onDragOver: React.PropTypes.func.isRequired,
    onDragStart: React.PropTypes.func.isRequired,
    onLinkClick: React.PropTypes.func.isRequired,
    onLinkTargetClick: React.PropTypes.func.isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    onRemoveClick: React.PropTypes.func.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onUnlinkClick: React.PropTypes.func.isRequired,
    onVisiblityToggle: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool.isRequired,
    sticky: React.PropTypes.bool.isRequired,
    stuck: React.PropTypes.bool.isRequired
  },

  getInitialState: function() {
    return {
      dragIn: null,
      dragOut: null,
      dragging: false,
      expanded: false
    };
  },

  componentWillMount: function() {
    this._keys = Object.keys(properties).filter(key => {
      return typeof this.props.layer[key] !== 'undefined';
    });
  },

  _onBarMouseDown: function(event) {
    if (event.button === 0) {
      event.stopPropagation();
      if (!this.props.selected) {
        this.props.onSelect(event);
      }

      this.setState({
        dragIn: this.props.layer.in,
        dragOut: this.props.layer.out,
        dragging: true
      });

      const rect = event.target.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      this._boundBarMouseMove = this._onBarMouseMove.bind(null, offsetX);
      document.addEventListener('mousemove', this._boundBarMouseMove);
      document.addEventListener('mouseup', this._onBarMouseUp);
    }
  },

  _onBarMouseMove: function(offsetX, event) {
    const barSize = this.state.dragOut - this.state.dragIn;
    let dragIn = ((event.clientX - offsetX) - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    let dragOut = dragIn + barSize;
    if (dragIn < 0) {
      dragIn = 0;
      dragOut = barSize;
    } else if (dragOut > 1) {
      dragOut = 1;
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
      event.stopPropagation();
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
    let position = (event.clientX - this.refs.track.offsetLeft) / this.refs.track.offsetWidth;
    if (position < 0) {
      position = 0;
    } else if (position > 1) {
      position = 1;
    }
    this.setState({[`drag${index ? 'Out' : 'In'}`]: position});
  },

  _onBarHandleMouseUp: function() {
    this.props.onPropertiesChange({
      in: this.state.dragIn,
      out: this.state.dragOut
    });
    this.setState({dragging: false});
    document.removeEventListener('mouseup', this._onBarHandleMouseUp);
    document.removeEventListener('mousemove', this._boundBarHandleMouseMove);
    delete this._boundBarHandleMouseMove;
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

  _addKeyframe: function(property) {
    let nextValue;
    const value = this.props.layer[property];
    if (typeof value === 'object') {
      const interpolatedValue = getInterpolatedValue(value, this.props.percentPlayed);
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
      [property]: getInterpolatedValue(value, this.props.percentPlayed)
    });
  },

  _renderControl: function(children, actions, props = {}) {
    return (
      <div className={classNames('pl-timeline-layer-control', props.className)}
          draggable={props.draggable}
          onClick={props.onClick}
          onDragEnd={props.onDragEnd}
          onDragStart={props.onDragStart}>
        {children}
        <div className="pl-timeline-layer-control-actions">
          {actions.map(function(action, index) {
            const actionClassName = classNames(
              'pl-timeline-layer-control-action',
              action.className,
              {'pl-clickable': action.onClick}
            );
            return (
              <div className={actionClassName}
                  key={index}
                  onClick={action.onClick}
                  title={action.title}>
                {action.children}
              </div>
            );
          })}
        </div>
      </div>
    );
  },

  render: function() {
    const layerClassName = classNames('pl-timeline-layer', {
      'pl-hidden': !this.props.layer.visible,
      'pl-linkable': this.props.linkable,
      'pl-selected': this.props.selected,
      'pl-sticky': this.state.expanded && this.props.sticky,
      'pl-stuck': this.state.expanded && this.props.stuck
    });

    const handles = [];
    for (var i = 0; i < 2; i++) {
      handles.push(
        <div className="pl-timeline-layer-bar-handle"
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

    const linkAction = {
      className: 'pl-timeline-layer-top-link'
    };
    if (this.props.linkable) {
      linkAction.children = <Icon name="target"/>;
      linkAction.onClick = this.props.onLinkTargetClick;
      linkAction.title = 'Link to this layer';
    } else {
      if (this.props.layer.parent === null) {
        linkAction.children = <Icon name="link"/>;
        if (this.props.layers.length > 1) {
          linkAction.onClick = this.props.onLinkClick;
          linkAction.title = 'Link Layer';
        }
      } else {
        const parent = this.props.layers.find(layer => layer.id === this.props.layer.parent);
        linkAction.children = (
          <div>
            <span>{parent.name}</span>
            <Icon className="pl-active" name="link"/>
          </div>
        );
        linkAction.onClick = this.props.onUnlinkClick;
        linkAction.title = `Linked to ${parent.name}`;
      }
    }

    return (
      <div className={layerClassName}
          onDragOver={this.props.onDragOver}
          onMouseDown={event => event.stopPropagation()}>
        <div className="pl-timeline-layer-top">
          {this._renderControl(
            (
              <TextField onChange={this._onNameChange}
                  value={this.props.layer.name}/>
            ),
            [
              linkAction,
              {
                children: (
                  <Icon className={this.state.expanded ? 'pl-active' : null}
                      name="more"/>
                ),
                onClick: this._onMoreClick,
                title: `${this.state.expanded ? 'Hide' : 'Show'} properties`
              },
              {
                children: <Icon name={this.props.layer.visible ? 'visible' : 'invisible'}/>,
                onClick: this.props.onVisiblityToggle,
                title: `${this.props.layer.visible ? 'Hide' : 'Show'} layer`
              },
              {
                children: <Icon name="trash"/>,
                onClick: this.props.onRemoveClick,
                title: 'Remove layer'
              }
            ],
            {
              draggable: true,
              onClick: this.props.onSelect,
              onDragEnd: this.props.onDragEnd,
              onDragStart: this.props.onDragStart
            }
          )}
          <div className="pl-timeline-layer-track"
              key={this.props.layer.id}
              ref="track">
            <div className="pl-timeline-layer-top-bar"
                onMouseDown={this._onBarMouseDown}
                style={{
                  left: `${layerIn * 100}%`,
                  right: `${100 - layerOut * 100}%`
                }}>
              {handles}
            </div>
          </div>
        </div>
        {this.state.expanded &&
          <div className="pl-timeline-layer-properties">
            {this._keys.map(key => {
              const property = properties[key];

              let propertyTrack;
              let value = this.props.layer[key];
              const propertyActions = [];

              if (property.animatable) {
                const animating = typeof value === 'object';
                const highlighted = animating && this.props.percentPlayed in value;
                value = getInterpolatedValue(value, this.props.percentPlayed);

                const addKeyframe = this._addKeyframe.bind(null, key);
                propertyActions.push(
                  {
                    children: (
                      <Icon className={animating ? 'pl-active' : null}
                          name="timer"/>
                    ),
                    onClick: animating ?
                        this._removeKeyframes.bind(null, key) : addKeyframe,
                    title: `${animating ? 'Disable' : 'Enable'} animation`
                  },
                  {
                    children: (
                      <Icon className={highlighted ? 'pl-active' : null}
                          name={highlighted ? 'remove' : 'add'}/>
                    ),
                    onClick: highlighted ?
                        this._removeKeyframe.bind(null, key) : addKeyframe,
                    title: `${highlighted ? 'Remove' : 'Add'} keyframe`
                  }
                );

                const keyframes = animating ? Object.keys(this.props.layer[key]) : [];
                propertyTrack = (
                  <div className="pl-timeline-layer-track">
                    {keyframes.map(function(keyframe, index) {
                      return (
                        <div className="pl-timeline-layer-property-keyframe"
                            key={index}
                            style={{left: `${keyframe * 100}%`}}/>
                      );
                    })}
                  </div>
                );
              } else {
                propertyActions.push({children: <Icon name="timer"/>},
                    {children: <Icon name="add"/>});
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
                children: propertyField
              });

              return (
                <div className="pl-timeline-layer-property"
                    key={key}>
                  {this._renderControl(sentenceCase(key), propertyActions)}
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
    }
  };
})(TimelineLayer);
