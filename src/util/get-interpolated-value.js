module.exports = function(value, position) {
  if (typeof value === 'number') {
    return value;
  } else if (position in value) {
    return value[position];
  }

  const bounds = Object.keys(value).sort();
  let lowerBound = bounds[0];
  let upperBound = bounds[bounds.length - 1];
  bounds.forEach(function(bound) {
    if (bound < position && bound > lowerBound) {
      lowerBound = bound;
    } else if (bound > position && bound < upperBound) {
      upperBound = bound;
    }
  });

  if (lowerBound === upperBound) {
    return value[lowerBound];
  }

  const progress = (position - lowerBound) / (upperBound - lowerBound);
  return (value[upperBound] - value[lowerBound]) * progress + value[lowerBound];
};
