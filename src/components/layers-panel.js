const React = require('react');

const LayersPanel = React.createClass({

  propTypes: {
    layers: React.PropTypes.array,
    width: React.PropTypes.number
  },

  render: function() {
    return (
      <div className="pl-layers-panel"
          style={{width: this.props.width}}>
        <div className="pl-layers-panel-layers">
          {this.props.layers.map(function(layer) {
            return (
              <div className="pl-layers-panel-layer" key={layer.id}>
                <span>{layer.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

module.exports = LayersPanel;
