const SNAP_TOLERANCE = 0.01;

export default (a, b) => Math.abs(a - b) <= SNAP_TOLERANCE;
