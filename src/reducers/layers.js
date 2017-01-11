const layerReducer = require('./layer');
const {linkLayers} = require('../actions');
const getNextId = require('../util/get-next-id');

module.exports = function(state = [], action) {
  switch (action.type) {
    case 'ADD_LAYER':
      return [
        ...state,
        layerReducer(undefined, Object.assign(action, {id: getNextId(state)}))
      ];
    case 'REMOVE_LAYER':
      var nextState = state.map(function(layer) {
        if (layer.parent && layer.parent.id === action.id) {
          return layerReducer(layer, linkLayers(layer.id, null));
        }
        return layer;
      });

      var index = -1;
      for (var i = 0; i < nextState.length; i++) {
        if (nextState[i].id === action.id) {
          index = i;
          break;
        }
      }

      return [...nextState.slice(0, index), ...nextState.slice(index + 1)];
    case 'ORDER_LAYERS':
      return action.order.map(id => state.find(layer => layer.id === id));
    case 'SET_LAYER_PROPERTIES':
    case 'TOGGLE_LAYER_VISIBILITY':
    case 'LINK_LAYERS':
      return state.map(layer => layerReducer(layer, action));
    case 'UPDATE_PROJECT':
      return action.layers;
    default:
      return state;
  }
};
