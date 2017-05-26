import PropTypes from 'prop-types';
import React from 'react';

const Circle = ({size, strokeWidth}) => (
  <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2} />
);

Circle.propTypes = {
  size: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number.isRequired
};

export default Circle;
