const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const sentenceCase = require('sentence-case');

const Control = require('./control');
const Icon = require('./icon');
const TextField = require('./text-field');

const {removeLayer, setLayerProperties, toggleLayerVisibility} = require('../actions');
const getInterpolatedValue = require('../util/get-interpolated-value');
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

const Layer = React.createClass({

  propTypes: {
    layer: React.PropTypes.object.isRequired,
    onDragEnd: React.PropTypes.func.isRequired,
    onDragOver: React.PropTypes.func.isRequired,
    onDragStart: React.PropTypes.func.isRequired,
    onPropertiesChange: React.PropTypes.func.isRequired,
    onRemoveClick: React.PropTypes.func.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onVisiblityToggle: React.PropTypes.func.isRequired,
    percentPlayed: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool
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

  render: function() {
    const layerClassName = classNames('pl-layer', {
      'pl-selected': this.props.selected,
      'pl-hidden': !this.props.layer.visible
    });

    const actions = [
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
    ];

    const handles = [];
    for (var i = 0; i < 2; i++) {
      handles.push(
        <div className="pl-layer-bar-handle"
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

    return (
      <div className={layerClassName}
          onDragOver={this.props.onDragOver}
          onMouseDown={event => event.stopPropagation()}>
        <Control actions={actions}
            className="pl-layer-name"
            draggable
            onClick={this.props.onSelect}
            onDragEnd={this.props.onDragEnd}
            onDragStart={this.props.onDragStart}>
          <span>{this.props.layer.name}</span>
        </Control>
        <div className="pl-layer-track"
            key={this.props.layer.id}
            ref="track">
          <div className="pl-layer-bar"
              onClick={event => event.stopPropagation()}
              onMouseDown={this._onBarMouseDown}
              style={{
                left: `${layerIn * 100}%`,
                right: `${100 - layerOut * 100}%`
              }}>
            {handles}
          </div>
        </div>
        {this.state.expanded &&
          <div className="pl-layer-properties">
            {this._keys.map(key => {
              const property = properties[key];

              let propertyTrack;
              let value = this.props.layer[key];
              const propertyActions = [];

              if (property.animatable) {
                const animating = typeof value === 'object';
                const highlighted = animating && this.props.percentPlayed in value;
                const interpolatedValue = getInterpolatedValue(value, this.props.percentPlayed);
                value = Math.round(interpolatedValue * 100) / 100;

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
                  <div className="pl-layer-track">
                    {keyframes.map(function(keyframe, index) {
                      return (
                        <div className="pl-layer-property-keyframe"
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

              propertyActions.unshift({
                children: property.mutable ?
                  <TextField onChange={this._onPropertyChange.bind(null, key)}
                      step={property.step}
                      type={property.type}
                      value={value}/> : <span>{value}</span>
              });

              return (
                <div className="pl-layer-property"
                    key={key}>
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

function mapDispatchToProps(dispatch, props) {
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
}

module.exports = connect(null, mapDispatchToProps)(Layer);
