const React = require('react');
const {connect} = require('react-redux');
const classNames = require('classnames');
const upperCaseFirst = require('upper-case-first');

const Button = require('./button');
const Icon = require('./icon');

const {setLayerProperties} = require('../actions');
const getAspectRatio = require('../util/get-aspect-ratio');
const getParentProperties = require('../util/get-parent-properties');
const getParents = require('../util/get-parents');
const getUnlinkedPosition = require('../util/get-unlinked-position');
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
    percentPlayed: React.PropTypes.number.isRequired,
    viewportScale: React.PropTypes.number.isRequired
  },

  _onAlignOptionClick: function(axis, amount) {
    let delta;
    let offset;
    const dimensions = this.props.getLayerDimensions(this.props.layer.id);
    if (axis === 'x') {
      delta = this.props.compositionWidth - dimensions.width;
      offset = dimensions.width * this.props.layer.anchorX;
    } else {
      delta = this.props.compositionHeight - dimensions.height;
      offset = dimensions.height * this.props.layer.anchorY;
    }
    let value = amount * delta + offset;

    if (this.props.layer.parent) {
      const parents = getParents(this.props.layer, this.props.layers);
      const parent = getParentProperties(parents, this.props.percentPlayed);
      const parentScale = parent.scale / this.props.layer.parent.offsetScale;
      value = getUnlinkedPosition(
        value,
        parent[axis],
        parentScale,
        this.props.layer.parent[`offset${axis.toUpperCase()}`]
      );
    }

    this.props.dispatch(setLayerProperties(this.props.layer.id, {
      [axis]: typeof this.props.layer[axis] === 'object' ?
          Object.assign({}, this.props.layer[axis], {
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
        <div className="sv-view-bar-info">
          <span>{`Aspect ratio: ${getAspectRatio(this.props.compositionWidth, this.props.compositionHeight)}`}</span>
          <span>{`Scale: ${Math.round(this.props.viewportScale * 1000) / 10}%`}</span>
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
                    <Button key={position}
                        onClick={!this.props.layer ? null :
                            this._onAlignOptionClick.bind(null, axis, index / 2)}
                        title={index % 2 ?
                            `${upperCaseFirst(position)} ${direction}ly` :
                            `Align ${position}`}>
                      <Icon name={iconName}/>
                    </Button>
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
