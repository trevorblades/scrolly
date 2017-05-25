const React = require('react');

const Shape = ({shape, size, strokeWidth}) => {
  const Shape = shape;
  return (
    <svg fill="none" stroke="black" strokeWidth={strokeWidth} style={{
      width: size,
      height: size
    }} viewBox={`0 0 ${size} ${size}`}>
      <Shape size={size} strokeWidth={strokeWidth}/>
    </svg>
  );
};

Shape.propTypes = {
  shape: React.PropTypes.func.isRequired,
  size: React.PropTypes.number.isRequired,
  strokeWidth: React.PropTypes.number.isRequired
};

module.exports = Shape;
