import PropTypes from 'prop-types';
import React from 'react';

const Rect = ({size, strokeWidth}) => (
  <rect
    height={size - strokeWidth}
    width={size - strokeWidth}
    x={strokeWidth / 2}
    y={strokeWidth / 2}
  />
);

Rect.propTypes = {
  size: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number.isRequired
};

export default Rect;
