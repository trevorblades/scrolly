const layer = require('./layer');

function layers(state = [], action) {
  switch (action.type) {
    case 'ADD_LAYER':
      return [...state, layer(undefined, action)];
    case 'TOGGLE_LAYER_VISIBILITY':
    case 'SET_LAYER_PROPERTIES':
      return state.map(l => layer(l, action));
    default:
      return state;
  }
}

module.exports = layers;
