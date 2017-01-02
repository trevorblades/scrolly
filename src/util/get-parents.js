module.exports = function(layer, layers) {
  const parents = [];
  let current = layer;
  while (current.parent) {
    current = layers.find(l => l.id === current.parent.id);
    parents.push(current);
  }
  return parents;
};
