module.exports = {
  ASSET_DRAG_TYPE: 'text/id',
  FILE_DRAG_TYPE: 'Files',
  PROPERTIES: {
    x: {
      type: 'number',
      animated: true
    },
    y: {
      type: 'number',
      animated: true
    },
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
    opacity: {
      type: 'number',
      animated: true,
      step: 0.01,
      min: 0,
      max: 1
    },
    width: {
      type: 'number',
      animated: true
    },
    height: {
      type: 'number',
      animated: true
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
