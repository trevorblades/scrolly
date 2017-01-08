const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const upperCaseFirst = require('upper-case-first');

const Icon = require('./icon');

const {setLayerProperties} = require('../actions');
const getParentProperties = require('../util/get-parent-properties');
const getParents = require('../util/get-parents');
const layerPropType = require('../util/layer-prop-type');

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
    layer: layerPropType,
    layers: React.PropTypes.arrayOf(layerPropType).isRequired,
    percentPlayed: React.PropTypes.number.isRequired
  },

  _onAlignOptionClick: function(properties) {
    const property = Object.keys(properties)[0];
    const dimensions = this.props.getLayerDimensions(this.props.layer.id);

    let value = properties[property] * (property === 'x' ?
        this.props.compositionWidth - dimensions.width :
        this.props.compositionHeight - dimensions.height);
    if (this.props.layer.parent) {
      const parents = getParents(this.props.layer, this.props.layers);
      const parent = getParentProperties(parents, this.props.percentPlayed);
      const parentScale = parent.scale / this.props.layer.parent.offsetScale;
      value = (value - parent[property]) / parentScale + this.props.layer.parent[`offset${property.toUpperCase()}`];
    }

    this.props.dispatch(setLayerProperties(this.props.layer.id, {
      [property]: typeof this.props.layer[property] === 'object' ?
          Object.assign({}, this.props.layer[property], {
            [this.props.percentPlayed]: value
          }) : value
    }));
  },

  render: function() {
    const alignClassName = classNames('sv-view-bar-align', {
      'pl-disabled': !this.props.layer
    });
    return (
      <div className="sv-view-bar">
        <div className="sv-view-bar-zoom">
          100%
        </div>
        <div className={alignClassName}>
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
                        onClick={!this.props.layer ? null :
                            this._onAlignOptionClick.bind(null, {[axis]: index / 2})}
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
        </div>
      </div>
    );
  }
});

module.exports = connect(function(state) {
  return {
    layer: state.layers.present.find(layer => layer.id === state.selectedLayer),
    layers: state.layers.present,
    percentPlayed: state.percentPlayed
  };
})(ViewBar);
