module.exports = (layer, parent, scale, offset) =>
  (layer - parent) / scale + offset;
