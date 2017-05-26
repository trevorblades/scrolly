const SNAP_TOLERANCE = 0.01;

module.exports = (a, b) => Math.abs(a - b) <= SNAP_TOLERANCE;
