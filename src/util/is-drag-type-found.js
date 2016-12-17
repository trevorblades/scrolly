module.exports = function(event, type) {
  let dragTypeFound = false;
  for (let i = 0; i < event.dataTransfer.types.length; ++i) {
    if (event.dataTransfer.types[i] === type) {
      dragTypeFound = true;
      break;
    }
  }
  return dragTypeFound;
};
