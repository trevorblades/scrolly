const React = require('react');
const {connect} = require('react-redux');
const sentenceCase = require('sentence-case');

const {setLayerProperties} = require('../actions');

const HIDDEN_PROPERTIES = ['id', 'type', 'name', 'visible', 'value'];

let Inspector = React.createClass({

  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    layer: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return Object.assign({}, this.props.layer);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.layer !== this.props.layer) {
      this.setState(Object.assign({}, nextProps.layer));
    }
  },

  _onPropertyChange: function(property, event) {
    this.props.dispatch(setLayerProperties(this.state.id, {
      [property]: event.target.value
    }));
  },

  _onInputKeyDown: function(property, event) {
    if (!isNaN(event.target.value) &&
        (event.keyCode === 38 || event.keyCode === 40)) {
      event.preventDefault();
      let movement = event.keyCode === 38 ? 1 : -1;
      if (event.shiftKey) {
        movement *= 10;
      }
      this._incrementProperty(property, movement);
    }
  },

  _onLabelMouseDown: function(property) {
    this._boundLabelMouseMove = this._onLabelMouseMove.bind(null, property);
    document.addEventListener('mousemove', this._boundLabelMouseMove);
    document.addEventListener('mouseup', this._onLabelMouseUp);
  },

  _onLabelMouseMove: function(property, event) {
    this._incrementProperty(property, event.movementX);
  },

  _onLabelMouseUp: function() {
    document.removeEventListener('mousemove', this._boundLabelMouseMove);
    document.removeEventListener('mouseup', this._onLabelMouseUp);
    delete this._boundLabelMouseMove;
  },

  _incrementProperty: function(property, value) {
    if (property === 'in' || property === 'out') {
      value /= 100;
    }
    this.props.dispatch(setLayerProperties(this.state.id, {
      [property]: this.state[property] + value
    }));
  },

  render: function() {
    const properties = Object.keys(this.state).filter(key => HIDDEN_PROPERTIES.indexOf(key) === -1);
    return (
      <div className="pl-inspector">
        <div className="pl-inspector-header">
          <input onChange={this._onPropertyChange.bind(null, 'name')}
              type="text"
              value={this.state.name}/>
        </div>
        <div className="pl-inspector-properties">
          {properties.map(property => {
            let labelProps;
            let value = this.state[property];
            const isNumber = !isNaN(value);
            if (isNumber) {
              value = Math.round(value * 100) / 100;
              labelProps = {
                onMouseDown: this._onLabelMouseDown.bind(null, property),
                style: {
                  cursor: 'ew-resize'
                }
              };
            }
            return (
              <div className="pl-inspector-property"
                  key={property}>
                <input onChange={this._onPropertyChange.bind(null, property)}
                    onKeyDown={this._onInputKeyDown.bind(null, property)}
                    type={isNumber ? 'number' : 'text'}
                    value={value}/>
                <label {...labelProps}>{sentenceCase(property)}</label>
                <span/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = connect()(Inspector);
