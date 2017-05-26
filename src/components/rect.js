const React = require('react');

const Rect = ({size, strokeWidth}) => (
  <rect
    height={size - strokeWidth}
    width={size - strokeWidth}
    x={strokeWidth / 2}
    y={strokeWidth / 2}
  />
);

Rect.propTypes = {
  size: React.PropTypes.number.isRequired,
  strokeWidth: React.PropTypes.number.isRequired
};

module.exports = Rect;
