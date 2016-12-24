module.exports = {
  ASSET_DRAG_TYPE: 'text/id',
  FILE_DRAG_TYPE: 'Files',
  PROPERTIES: {
    in: {
      type: 'number',
      step: 0.01,
      min: 0,
      max: 1
    },
    out: {
      type: 'number',
      step: 0.01,
      min: 0,
      max: 1
    },
    x: {
      type: 'number',
      animated: true
    },
    y: {
      type: 'number',
      animated: true
    },
    scale: {
      type: 'number',
      animated: true,
      step: 0.01
    },
    opacity: {
      type: 'number',
      animated: true,
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
      type: 'number',
      min: 1
    },
    fontWeight: {
      type: 'text'
    },
    fontStyle: {
      type: 'text'
    }
  }
};
