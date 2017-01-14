const {combineReducers} = require('redux');
const undoable = require('redux-undo').default;
const {excludeAction} = require('redux-undo');

const assetsReducer = require('./assets');
const layersReducer = require('./layers');

const {DEFAULT_NAME} = require('../constants');

const undoConfig = {filter: excludeAction([
  'SET_PERCENT_PLAYED',
  'SELECT_LAYER'
])};

function createUpdateReducer(key, defaultState = null) {
  return function(state = defaultState, action) {
    return action.type === 'UPDATE_PROJECT' ? action[key] : state;
  };
}

const combinedReducer = combineReducers({
  id: createUpdateReducer('id'),
  slug: createUpdateReducer('slug'),
  name: undoable(function(state = DEFAULT_NAME, action) {
    if (action.type === 'UPDATE_PROJECT' || action.type === 'RESET') {
      return action.name;
    }
    return state;
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
  createdAt: createUpdateReducer('createdAt'),
  updatedAt: createUpdateReducer('updatedAt'),
  changedAt: undoable(function(state = null, action) {
    switch (action.type) {
      case 'UPDATE_PROJECT':
        return new Date(action.updatedAt).toISOString();
      case 'SET_NAME':
      case 'SET_STEP':
      case 'SET_LAYER_PROPERTIES':
      case 'ADD_LAYER':
      case 'REMOVE_LAYER':
      case 'ORDER_LAYERS':
      case 'TOGGLE_LAYER_VISIBILITY':
      case 'LINK_LAYERS':
      case 'ADD_ASSET':
      case 'REMOVE_ASSET':
        return new Date().toISOString();
      default:
        return state;
    }
  }),
  width: function(state = 1920, action) {
    if (action.type === 'UPDATE_PROJECT' || action.type === 'RESET') {
      return action.width;
    }
    return state;
  },
  height:  function(state = 1080, action) {
    if (action.type === 'UPDATE_PROJECT' || action.type === 'RESET') {
      return action.height;
    }
    return state;
  },
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
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};
