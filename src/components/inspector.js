const React = require('react');
const sentenceCase = require('sentence-case');

const {setLayerProperties} = require('../actions');

const HIDDEN_PROPERTIES = ['id', 'type', 'name', 'visible', 'value'];

const Inspector = React.createClass({

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
      let direction = event.keyCode === 38 ? 1 : -1;
      if (property === 'in' || property === 'out') {
        direction /= 100;
      }
      if (event.shiftKey) {
        direction *= 10;
      }
      this.props.dispatch(setLayerProperties(this.state.id, {
        [property]: parseFloat(event.target.value) + direction
      }));
    }
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
            let value = this.state[property];
            const isNumber = !isNaN(value);
            if (isNumber) {
              value = Math.round(value * 100) / 100;
            }
            return (
              <div className="pl-inspector-property"
                  key={property}>
                <label>{sentenceCase(property)}</label>
                <input onChange={this._onPropertyChange.bind(null, property)}
                    onKeyDown={this._onInputKeyDown.bind(null, property)}
                    type={isNumber ? 'number' : 'text'}
                    value={value}/>
                <span/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Inspector;
