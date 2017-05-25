const React = require('react');

const Shape = ({fill, shape, size, stroke, strokeWidth}) => {
  const Shape = shape;
  return (
    <svg fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={{
      width: size,
      height: size
    }} viewBox={`0 0 ${size} ${size}`}>
      <Shape size={size} strokeWidth={strokeWidth}/>
    </svg>
  );
};

Shape.propTypes = {
  fill: React.PropTypes.string,
  shape: React.PropTypes.func.isRequired,
  size: React.PropTypes.number,
  stroke: React.PropTypes.string,
  strokeWidth: React.PropTypes.number
};

Shape.defaultProps = {
  fill: 'none',
  size: 100,
  stroke: 'black',
  strokeWidth: 2
};

module.exports = Shape;
