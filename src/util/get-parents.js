module.exports = function(layer, layers) {
  let current = layer;
  const parents = [];
  while (current && current.parent) {
    current = layers.find(l => l.id === current.parent.id);
    parents.unshift(current);
  }
  return parents;
};
