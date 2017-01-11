module.exports = function(state, action) {
  switch (action.type) {
    case 'ADD_ASSET':
      return {
        id: action.id,
        name: action.name,
        mimeType: action.mimeType,
        size: action.size,
        src: action.src,
        width: action.width,
        height: action.height
      };
    default:
      return state;
  }
};
