module.exports = function(state, action) {
  switch (action.type) {
    case 'ADD_ASSET':
      return {
        id: action.id,
        name: action.name,
        filetype: action.filetype,
        size: action.size,
        data: action.data,
        width: action.width,
        height: action.height
      };
    default:
      return state;
  }
};
