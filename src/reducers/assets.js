import assetReducer from './asset';
import getNextId from '../util/get-next-id';

export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_ASSET':
      return [
        ...state,
        assetReducer(undefined, Object.assign(action, {id: getNextId(state)}))
      ];
    case 'REMOVE_ASSET': {
      let index = -1;
      for (let i = 0; i < state.length; i += 1) {
        if (state[i].id === action.id) {
          index = i;
          break;
        }
      }
      return [...state.slice(0, index), ...state.slice(index + 1)];
    }
    case 'LOAD_PROJECT':
      return action.assets;
    default:
      return state;
  }
};
