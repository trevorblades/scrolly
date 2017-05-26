import {combineReducers} from 'redux';
import undoable, {excludeAction} from 'redux-undo';

import assetsReducer from './assets';
import layersReducer from './layers';

import {DEFAULT_NAME} from '../constants';

const undoConfig = {
  filter: excludeAction(['SET_PERCENT_PLAYED', 'SELECT_LAYER'])
};

function createLoadableReducer(key, defaultState = null) {
  return (state = defaultState, action) =>
    action.type === 'LOAD_PROJECT' ? action[key] : state;
}

function createUpdatableReducer(key, defaultState = null) {
  return (state = defaultState, action) => {
    switch (action.type) {
      case 'LOAD_PROJECT':
      case 'UPDATE_PROJECT':
      case 'RESET_PROJECT':
        return action[key];
      default:
        return state;
    }
  };
}

const combinedReducer = combineReducers({
  id: createLoadableReducer('id'),
  slug: createLoadableReducer('slug'),
  name: undoable(createUpdatableReducer('name', DEFAULT_NAME)),
  assets: undoable(assetsReducer, undoConfig),
  layers: undoable(layersReducer, undoConfig),
  step: undoable((state = 1, action) => {
    switch (action.type) {
      case 'SET_STEP':
        return action.value;
      case 'LOAD_PROJECT':
        return action.step;
      default:
        return state;
    }
  }, undoConfig),
  createdAt: createLoadableReducer('createdAt'),
  updatedAt: createLoadableReducer('updatedAt'),
  changedAt: undoable((state = null, action) => {
    switch (action.type) {
      case 'LOAD_PROJECT':
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
      case 'UPDATE_PROJECT':
        return new Date().toISOString();
      default:
        return state;
    }
  }),
  width: createUpdatableReducer('width', 1920),
  height: createUpdatableReducer('height', 1080),
  percentPlayed(state = 0, action) {
    if (action.type === 'SET_PERCENT_PLAYED') {
      return action.value;
    }
    return state;
  },
  selectedLayer(state = null, action) {
    if (action.type === 'SELECT_LAYER') {
      return action.id;
    }
    return state;
  }
});

export default (state, action) => {
  if (action.type === 'RESET_PROJECT') {
    return combinedReducer(undefined, action);
  }
  return combinedReducer(state, action);
};
