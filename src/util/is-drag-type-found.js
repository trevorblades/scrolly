module.exports = function(event, ...types) {
  let dragTypeFound = false;
  for (let i = 0; i < event.dataTransfer.types.length; ++i) {
    if (types.includes(event.dataTransfer.types[i])) {
      dragTypeFound = true;
      break;
    }
  }
  return dragTypeFound;
};
