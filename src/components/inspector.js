const React = require('react');
const sentenceCase = require('sentence-case');

const Inspector = React.createClass({

  propTypes: {
    layer: React.PropTypes.object.isRequired,
    setLayerProperties: React.PropTypes.func.isRequired
  },

  _onPropertyChange: function(key, event) {
    this.props.setLayerProperties(this.props.layer.id, {[key]: event.target.value});
  },

  render: function() {
    return (
      <div className="pl-inspector">
        <div className="pl-inspector-properties">
          {Object.keys(this.props.layer).map(key => {
            const inputId = `pl-inspector-property-${key}`;
            return (
              <div className="pl-inspector-property"
                  key={key}>
                <label htmlFor={inputId}>{sentenceCase(key)}</label>
                <input id={inputId}
                    onChange={this._onPropertyChange.bind(null, key)}
                    type="text"
                    value={this.props.layer[key]}/>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = Inspector;
