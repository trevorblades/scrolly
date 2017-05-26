import PropTypes from 'prop-types';
import React from 'react';

const Shape = props => {
  const Component = props.shape;
  return (
    <svg
      fill={props.fill}
      stroke={props.stroke}
      strokeWidth={props.strokeWidth}
      style={{
        ...{
          width: props.size,
          height: props.size
        },
        ...props.style
      }}
      viewBox={`0 0 ${props.size} ${props.size}`}
    >
      <Component size={props.size} strokeWidth={props.strokeWidth} />
    </svg>
  );
};

Shape.propTypes = {
  fill: PropTypes.string,
  shape: PropTypes.func.isRequired,
  size: PropTypes.number,
  stroke: PropTypes.string,
  strokeWidth: PropTypes.number,
  style: PropTypes.object
};

Shape.defaultProps = {
  fill: 'none',
  size: 100,
  stroke: 'black',
  strokeWidth: 2
};

export default Shape;
