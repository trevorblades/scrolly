module.exports = {
  in: {
    mutable: true,
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1
  },
  out: {
    mutable: true,
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1
  },
  x: {
    mutable: true,
    animatable: true,
    type: 'number'
  },
  y: {
    mutable: true,
    animatable: true,
    type: 'number'
  },
  scale: {
    mutable: true,
    animatable: true,
    type: 'number',
    step: 0.01
  },
  opacity: {
    mutable: true,
    animatable: true,
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1
  },
  width: {
    type: 'number'
  },
  height: {
    type: 'number'
  },
  fontSize: {
    mutable: true,
    type: 'number',
    min: 1
  },
  fontWeight: {
    mutable: true,
    type: 'text'
  },
  fontStyle: {
    mutable: true,
    type: 'text'
  }
};
