const assetReducer = require('./asset');
const getNextId = require('../util/get-next-id');

module.exports = function(state = [], action) {
  switch (action.type) {
    case 'ADD_ASSET':
      return [
        ...state,
        assetReducer(undefined, Object.assign(action, {id: getNextId(state)}))
      ];
    case 'REMOVE_ASSET':
      var index = -1;
      for (var i = 0; i < state.length; i++) {
        if (state[i].id === action.id) {
          index = i;
          break;
        }
      }
      return [...state.slice(0, index), ...state.slice(index + 1)];
    case 'LOAD_PROJECT':
      return action.assets;
    default:
      return state;
  }
};
