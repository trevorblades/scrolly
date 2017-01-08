const React = require('react');
const {connect} = require('react-redux');
const upperCaseFirst = require('upper-case-first');

const Icon = require('./icon');

const {setLayerProperties} = require('../actions');

const alignOptions = {
  x: ['left', 'center', 'right'],
  y: ['top', 'center', 'bottom']
};

const ViewBar = React.createClass({

  propTypes: {
    compositionHeight: React.PropTypes.number.isRequired,
    compositionWidth: React.PropTypes.number.isRequired,
    dispatch: React.PropTypes.func.isRequired,
    getLayerDimensions: React.PropTypes.func.isRequired,
    layer: React.PropTypes.object,
    percentPlayed: React.PropTypes.number.isRequired
  },

  _onAlignOptionClick: function(properties) {
    const property = Object.keys(properties)[0];
    const dimensions = this.props.getLayerDimensions(this.props.layer.id);
    const size = property === 'x' ?
        this.props.compositionWidth - dimensions.width :
        this.props.compositionHeight - dimensions.height;
    let value = properties[property] * size;
    if (typeof this.props.layer[property] === 'object') {
      value = Object.assign({}, this.props.layer[property], {
        [this.props.percentPlayed]: value
      });
    }
    this.props.dispatch(setLayerProperties(this.props.layer.id, {
      [property]: value
    }));
  },

  render: function() {
    return (
      <div className="sv-view-bar">
        <div className="sv-view-bar-zoom">
          100%
        </div>
        {this.props.layer && <div className="sv-view-bar-align">
          {Object.keys(alignOptions).map(axis => {
            const direction = axis === 'x' ? 'horizontal' : 'vertical';
            return (
              <div className="sv-view-bar-align-options" key={axis}>
                {alignOptions[axis].map((position, index) => {
                  let iconName = `align${upperCaseFirst(position)}`;
                  if (position === 'center') {
                    iconName += upperCaseFirst(direction);
                  }
                  return (
                    <div className="sv-view-bar-align-option"
                        key={position}
                        onClick={this._onAlignOptionClick.bind(null, {[axis]: index / 2})}
                        title={index % 2 ?
                            `${upperCaseFirst(position)} ${direction}ly` :
                            `Align ${position}`}>
                      <Icon name={iconName}/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>}
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    layer: state.layers.present.find(layer => layer.id === state.selectedLayer),
    percentPlayed: state.percentPlayed
  };
})(ViewBar);
