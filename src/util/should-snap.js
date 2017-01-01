const SNAP_TOLERANCE = 0.01;

module.exports = function(a, b) {
  return Math.abs(a - b) <= SNAP_TOLERANCE;
};
