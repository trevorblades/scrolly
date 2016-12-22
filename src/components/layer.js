const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const sentenceCase = require('sentence-case');

const Control = require('./control');
const Icon = require('./icon');

const {
  removeLayer,
  setLayerProperties,
  toggleLayerVisibility
} = require('../actions');
const {PROPERTIES} = require('../constants');

const animatedProperties = [];
for (var key in PROPERTIES) {
  if (PROPERTIES[key].animated) {
    animatedProperties.push(key);
  }
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
    this._properties = animatedProperties.filter(property => {
      return typeof this.props.layer[property] !== 'undefined';
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

  _onAnimateToggle: function(property) {
    let nextValue;
    const value = this.props.layer[property];
    if (typeof value === 'object') {
      const key = Object.keys(value)[0];
      nextValue = value[key];
    } else {
      nextValue = {[this.props.percentPlayed]: value};
    }
    this.props.onPropertiesChange({[property]: nextValue});
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
        onClick: this._onMoreClick
      },
      {
        children: <Icon name={this.props.layer.visible ? 'visible' : 'invisible'}/>,
        onClick: this.props.onVisiblityToggle
      },
      {
        children: <Icon name="trash"/>,
        onClick: this.props.onRemoveClick
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
            {this._properties.map(property => {
              const propertyActions = [{children: <Icon name="timer"/>}];

              let keyframes = [];
              if (typeof this.props.layer[property] === 'object') {
                keyframes = Object.keys(this.props.layer[property]);
              }

              return (
                <div className="pl-layer-property"
                    key={property}>
                  <Control actions={propertyActions}>
                    {sentenceCase(property)}
                  </Control>
                  <div className="pl-layer-track"
                      key={property}>
                    {keyframes.map(function(keyframe, index) {
                      return (
                        <div className="pl-layer-property-keyframe"
                            key={index}
                            style={{left: `${keyframe * 100}%`}}/>
                      );
                    })}
                  </div>
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
