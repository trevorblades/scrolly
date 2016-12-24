const React = require('react');

const Animatable = React.PropTypes.oneOfType([
  React.PropTypes.number,
  React.PropTypes.object
]);

module.exports = React.PropTypes.shape({
  id: React.PropTypes.number.isRequired,
  type: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  in: React.PropTypes.number.isRequired,
  out: React.PropTypes.number.isRequired,
  x: Animatable.isRequired,
  y: Animatable.isRequired,
  scale: Animatable.isRequired,
  opacity: Animatable.isRequired,
  visible: React.PropTypes.bool.isRequired,

  // text props
  value: React.PropTypes.string,
  fontSize: React.PropTypes.number,
  fontStyle: React.PropTypes.string,
  fontWeight: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.string
  ]),

  // image props
  src: React.PropTypes.string,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  aspectRatio: React.PropTypes.number
});
