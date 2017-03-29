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
  anchorX: {
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1,
    default: 0,
    mutable: true
  },
  anchorY: {
    type: 'number',
    step: 0.01,
    min: 0,
    max: 1,
    default: 0,
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
  rotation: {
    type: 'number',
    default: 0,
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
  paddingX: {
    type: 'number',
    default: 0,
    mutable: true
  },
  paddingY: {
    type: 'number',
    default: 0,
    mutable: true
  },
  fontSize: {
    type: 'number',
    min: 1,
    default: 24,
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
  },
  fontColor: {
    type: 'text',
    default: 'black',
    mutable: true
  },
  backgroundColor: {
    type: 'text',
    default: 'transparent',
    mutable: true
  }
};
