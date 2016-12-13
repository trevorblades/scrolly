const {combineReducers} = require('redux');
const undoable = require('redux-undo').default;

const layers = require('./layers');

module.exports = combineReducers({
  layers: undoable(layers)
});
