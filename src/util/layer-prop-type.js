import PropTypes from 'prop-types';

const Animatable = PropTypes.oneOfType([PropTypes.number, PropTypes.object]);

export default PropTypes.shape({
  id: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  in: PropTypes.number.isRequired,
  out: PropTypes.number.isRequired,
  x: Animatable.isRequired,
  y: Animatable.isRequired,
  scale: Animatable.isRequired,
  opacity: Animatable.isRequired,
  visible: PropTypes.bool.isRequired,

  // text props
  value: PropTypes.string,
  fontSize: PropTypes.number,
  fontStyle: PropTypes.string,
  fontWeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  // image props
  src: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  aspectRatio: PropTypes.number
});
