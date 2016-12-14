const layer = require('./layer');

function layers(state = [], action) {
  switch (action.type) {
    case 'ADD_LAYER':
      return [...state, layer(undefined, action)];
    case 'DELETE_LAYER':
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
      return state.map(l => layer(l, action));
    default:
      return state;
  }
}

module.exports = layers;
