module.exports = function(state, action) {
  switch (action.type) {
    case 'ADD_LAYER':
      var layer = {
        id: action.id,
        type: action.layerType,
        name: `Layer ${action.id + 1}`,
        in: 0,
        out: 1,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        visible: true
      };

      switch (layer.type) {
        case 'text':
          layer.value = 'Enter text here';
          layer.fontSize = 16;
          layer.fontWeight = 'normal';
          layer.fontStyle = 'normal';
          break;
        case 'image':
          layer.src = action.src;
          layer.width = action.width;
          layer.height = action.height;
          layer.aspectRatio = layer.width / layer.height;
          layer.constrainProportions = true;
          break;
        default:
      }

      return layer;
    case 'SET_LAYER_PROPERTIES':
      if (state.id !== action.id) {
        return state;
      }
      if (('width' in action.properties || 'height' in action.properties) &&
          state.constrainProportions) {
        if ('width' in action.properties) {
          action.properties.height = action.properties.width / state.aspectRatio;
        } else {
          action.properties.width = action.properties.height * state.aspectRatio;
        }
      }
      return Object.assign({}, state, action.properties);
    case 'TOGGLE_LAYER_VISIBILITY':
      if (state.id !== action.id) {
        return state;
      }
      return Object.assign({}, state, {visible: !state.visible});
    default:
      return state;
  }
};
