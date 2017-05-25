const React = require('react');

const Circle = ({size, strokeWidth}) => <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2}/>;

Circle.propTypes = {
  size: React.PropTypes.number.isRequired,
  strokeWidth: React.PropTypes.number.isRequired
};

module.exports = Circle;
