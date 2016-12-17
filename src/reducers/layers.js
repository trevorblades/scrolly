const layerReducer = require('./layer');

module.exports = function(state = [], action) {
  switch (action.type) {
    case 'ADD_LAYER':
      return [...state, layerReducer(undefined, action)];
    case 'REMOVE LAYER':
      var index = -1;
      for (var i = 0; i < state.length; i++) {
        if (state[i].id === action.id) {
          index = i;
          break;
        }
      }
      return [...state.slice(0, index), ...state.slice(index + 1)];
    case 'SET_LAYER_PROPERTIES':
    case 'TOGGLE_LAYER_VISIBILITY':
      return state.map(layer => layerReducer(layer, action));
    default:
      return state;
  }
};
