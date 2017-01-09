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

function getUpdateReducer(key, formatter, defaultState = null) {
  return function(state = defaultState, action) {
    if (action.type === 'UPDATE_PROJECT') {
      return formatter ? formatter(action[key]) : action[key];
    }
    return state;
  };
}

module.exports = combineReducers({
  id: getUpdateReducer('id'),
  slug: getUpdateReducer('slug'),
  name: undoable(getUpdateReducer('name', null, 'Untitled project')),
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
  createdAt: getUpdateReducer('createdAt', date => new Date(date)),
  updatedAt: getUpdateReducer('updatedAt', date => new Date(date)),
  changedAt: undoable(function(state = null, action) {
    if (action.type === 'UPDATE_PROJECT') {
      return new Date(action.updatedAt);
    } else if (action.type !== 'SET_PERCENT_PLAYED' &&
        action.type !== 'SELECT_LAYER') {
      return new Date();
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
