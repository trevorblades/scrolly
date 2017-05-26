const React = require('react');

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
  fill: React.PropTypes.string,
  shape: React.PropTypes.func.isRequired,
  size: React.PropTypes.number,
  stroke: React.PropTypes.string,
  strokeWidth: React.PropTypes.number,
  style: React.PropTypes.object
};

Shape.defaultProps = {
  fill: 'none',
  size: 100,
  stroke: 'black',
  strokeWidth: 2
};

module.exports = Shape;
