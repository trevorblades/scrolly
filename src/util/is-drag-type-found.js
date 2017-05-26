export default (event, ...types) => {
  let dragTypeFound = false;
  for (let i = 0; i < event.dataTransfer.types.length; i += 1) {
    if (types.includes(event.dataTransfer.types[i])) {
      dragTypeFound = true;
      break;
    }
  }
  return dragTypeFound;
};
