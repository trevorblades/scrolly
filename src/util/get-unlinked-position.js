export default (layer, parent, scale, offset) =>
  (layer - parent) / scale + offset;
