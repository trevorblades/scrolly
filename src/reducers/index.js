const {combineReducers} = require('redux');
const undoable = require('redux-undo').default;
const {excludeAction} = require('redux-undo');

const assetsReducer = require('./assets');
const layersReducer = require('./layers');

const undoConfig = {
  filter: excludeAction([
    'SET_PERCENT_PLAYED',
    'SELECT_LAYER'
  ])
};

module.exports = combineReducers({
  assets: undoable(assetsReducer, undoConfig),
  layers: undoable(layersReducer, undoConfig),
  step: undoable(function(state = 1, action) {
    switch (action.type) {
      case 'SET_STEP':
        return action.value;
      case 'UPDATE_PROJECT':
        return action.step;
      default:
        return state;
    }
  }, undoConfig),
  percentPlayed: function(state = 0, action) {
    if (action.type === 'SET_PERCENT_PLAYED') {
      return action.value;
    }
    return state;
  },
  selectedLayer: function(state = null, action) {
    if (action.type === 'SELECT_LAYER') {
      return action.id;
    }
    return state;
  }
});
