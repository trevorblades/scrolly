function layer(state, action) {
  switch (action.type) {
    case 'ADD_LAYER':
      return {
        id: action.id,
        type: 'text',
        name: `Layer ${action.id + 1}`,
        x: 0,
        y: 0,
        in: 0,
        out: 1,
        visible: true,
        value: 'Enter text here',
        fontSize: 16,
        fontWeight: 'regular',
        fontStyle: 'normal'
      };
    case 'SET_LAYER_PROPERTIES':
      if (state.id !== action.id) {
        return state;
      }
      return Object.assign({}, state, action.properties);
    case 'TOGGLE_LAYER_VISIBILITY':
      if (state.id !== action.id) {
        return state;
      }
      return Object.assign({}, state, {visible: !state.visible});
    default:
      return state;
  }
}

module.exports = layer;
