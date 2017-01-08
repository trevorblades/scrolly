module.exports = function(layer, parent, scale, offset) {
  return (layer - parent) / scale + offset;
};
