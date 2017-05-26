import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import upperCaseFirst from 'upper-case-first';

import Button from './button';
import Icon from './icon';

import {setLayerProperties} from '../actions';
import getAspectRatio from '../util/get-aspect-ratio';
import getParentProperties from '../util/get-parent-properties';
import getParents from '../util/get-parents';
import getUnlinkedPosition from '../util/get-unlinked-position';
import layerPropType from '../util/layer-prop-type';

const alignOptions = {
  x: ['left', 'center', 'right'],
  y: ['top', 'center', 'bottom']
};

const ViewBar = React.createClass({
  propTypes: {
    compositionHeight: PropTypes.number.isRequired,
    compositionWidth: PropTypes.number.isRequired,
    dispatch: PropTypes.func.isRequired,
    getLayerDimensions: PropTypes.func.isRequired,
    layer: layerPropType,
    layers: PropTypes.arrayOf(layerPropType).isRequired,
    percentPlayed: PropTypes.number.isRequired,
    viewportScale: PropTypes.number.isRequired
  },

  onAlignOptionClick(axis, amount) {
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

    this.props.dispatch(
      setLayerProperties(this.props.layer.id, {
        [axis]: typeof this.props.layer[axis] === 'object'
          ? {
              ...this.props.layer[axis],
              ...{
                [this.props.percentPlayed]: value
              }
            }
          : value
      })
    );
  },

  render() {
    const alignClassName = classNames('sv-view-bar-align', {
      'pl-disabled': !this.props.layer
    });
    return (
      <div className="sv-view-bar">
        <div className="sv-view-bar-info">
          <span
          >{`Aspect ratio: ${getAspectRatio(this.props.compositionWidth, this.props.compositionHeight)}`}</span>
          <span
          >{`Scale: ${Math.round(this.props.viewportScale * 1000) / 10}%`}</span>
        </div>
        <div className={alignClassName}>
          {Object.keys(alignOptions).map(axis => {
            const direction = axis === 'x' ? 'horizontal' : 'vertical';
            return (
              <div key={axis} className="sv-view-bar-align-options">
                {alignOptions[axis].map((position, index) => {
                  let iconName = `align${upperCaseFirst(position)}`;
                  if (position === 'center') {
                    iconName += upperCaseFirst(direction);
                  }
                  return (
                    <Button
                      key={position}
                      onClick={
                        !this.props.layer
                          ? null
                          : () => this.onAlignOptionClick(axis, index / 2)
                      }
                      title={
                        index % 2
                          ? `${upperCaseFirst(position)} ${direction}ly`
                          : `Align ${position}`
                      }
                    >
                      <Icon name={iconName} />
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

export default connect(state => ({
  layer: state.layers.present.find(layer => layer.id === state.selectedLayer),
  layers: state.layers.present,
  percentPlayed: state.percentPlayed
}))(ViewBar);
