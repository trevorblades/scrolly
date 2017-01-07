const properties = require('../util/properties');

module.exports = function(state, action) {
  switch (action.type) {
    case 'ADD_LAYER':
      var layer = {
        id: action.id,
        type: action.layerType,
        name: `Layer ${action.id + 1}`,
        in: properties.in.default,
        out: properties.out.default,
        anchorX: properties.anchorX.default,
        anchorY: properties.anchorX.default,
        x: properties.x.default,
        y: properties.y.default,
        scale: properties.scale.default,
        rotation: properties.rotation.default,
        opacity: properties.opacity.default,
        visible: true,
        parent: null
      };

      switch (layer.type) {
        case 'text':
          layer.value = 'Enter text here';
          layer.fontSize = properties.fontSize.default;
          layer.fontWeight = properties.fontWeight.default;
          layer.fontStyle = properties.fontStyle.default;
          layer.fontColor = properties.fontColor.default;
          break;
        case 'image':
          layer.asset = action.asset;
          break;
        default:
      }

      return layer;
    case 'SET_LAYER_PROPERTIES':
      if (state.id !== action.id) {
        return state;
      }
      return Object.assign({}, state, action.properties);
    case 'TOGGLE_LAYER_VISIBILITY':
      if (state.id !== action.id) {
        return state;
      }
      return Object.assign({}, state, {visible: !state.visible});
    case 'LINK_LAYERS':
      if (state.id !== action.child) {
        return state;
      }
      return Object.assign({}, state, {parent: action.parent});
    default:
      return state;
  }
};
