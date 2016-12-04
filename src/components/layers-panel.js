const React = require('react');

const LayersPanel = React.createClass({

  propTypes: {
    layers: React.PropTypes.object.isRequired,
    width: React.PropTypes.number
  },

  render: function() {
    return (
      <div className="pl-layers-panel"
          style={{width: this.props.width}}>
        <div className="pl-layers-panel-layers">
          {Object.keys(this.props.layers).map(key => {
            const layer = this.props.layers[key];
            return (
              <div className="pl-layers-panel-layer" key={key}>
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
