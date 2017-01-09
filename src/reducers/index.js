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

function getUpdateReducer(key, defaultState = null) {
  return function(state = defaultState, action) {
    return action.type === 'UPDATE_PROJECT' ? action[key] : state;
  };
}

const combinedReducer = combineReducers({
  id: getUpdateReducer('id'),
  slug: getUpdateReducer('slug'),
  name: undoable(function(state = 'Untitled project', action) {
    switch (action.type) {
      case 'SET_NAME':
        return action.value;
      case 'UPDATE_PROJECT':
        return action.name;
      default:
        return state;
    }
  }),
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
  createdAt: getUpdateReducer('createdAt'),
  updatedAt: getUpdateReducer('updatedAt'),
  changedAt: undoable(function(state = null, action) {
    if (action.type === 'UPDATE_PROJECT') {
      return new Date(action.updatedAt).toISOString();
    } else if (action.type !== 'SET_PERCENT_PLAYED' &&
        action.type !== 'SELECT_LAYER') {
      return new Date().toISOString();
    }
    return state;
  }),
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

module.exports = function(state, action) {
  if (action.type === 'RESET') {
    state = undefined;
  }
  return combinedReducer(state, action);
};
