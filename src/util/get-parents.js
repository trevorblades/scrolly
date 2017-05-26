module.exports = (layer, layers) => {
  let current = layer;
  const parents = [];
  while (current && current.parent) {
    // eslint-disable-next-line no-loop-func
    current = layers.find(l => l.id === current.parent.id);
    parents.unshift(current);
  }
  return parents;
};
