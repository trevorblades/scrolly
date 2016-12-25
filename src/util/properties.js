const anchorOptions = ['top', 'center', 'bottom'].reduce(function(arr, y) {
  return arr.concat(['left', 'center', 'right'].map(function(x) {
    if (x === y) {
      return x;
    }
    return `${y} ${x}`;
  }));
}, []);

module.exports = {
  in: {
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1,
    default: 0,
    mutable: true
  },
  out: {
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1,
    default: 1,
    mutable: true
  },
  anchor: {
    type: 'enum',
    options: anchorOptions,
    default: anchorOptions[0],
    mutable: true
  },
  x: {
    type: 'number',
    default: 0,
    mutable: true,
    animatable: true
  },
  y: {
    type: 'number',
    default: 0,
    mutable: true,
    animatable: true
  },
  scale: {
    type: 'number',
    step: 0.01,
    default: 1,
    mutable: true,
    animatable: true
  },
  opacity: {
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1,
    default: 1,
    mutable: true,
    animatable: true
  },
  width: {
    type: 'number'
  },
  height: {
    type: 'number'
  },
  fontSize: {
    type: 'number',
    min: 1,
    default: 16,
    mutable: true
  },
  fontWeight: {
    type: 'text',
    default: 'normal',
    mutable: true
  },
  fontStyle: {
    type: 'text',
    default: 'normal',
    mutable: true
  }
};
