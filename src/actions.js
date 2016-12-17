let nextLayerId = 0;
let nextAssetId = 0;

function addLayer(type) {
  return {
    type: 'ADD_LAYER',
    id: nextLayerId++,
    layerType: type
  };
}

function addImageLayer(src) {
  const action = addLayer('image');
  action.src = src;
  return action;
}

function removeLayer(id) {
  return {
    type: 'REMOVE LAYER',
    id
  };
}

function setLayerProperties(id, properties) {
  return {
    type: 'SET_LAYER_PROPERTIES',
    id,
    properties
  };
}

function toggleLayerVisibility(id) {
  return {
    type: 'TOGGLE_LAYER_VISIBILITY',
    id
  };
}

function addAsset(name, filetype, size, data) {
  return {
    type: 'ADD_ASSET',
    id: nextAssetId++,
    name,
    filetype,
    size,
    data
  };
}

function removeAsset(id) {
  return {
    type: 'REMOVE_ASSET',
    id
  };
}

module.exports = {
  addLayer,
  addImageLayer,
  removeLayer,
  setLayerProperties,
  toggleLayerVisibility,
  addAsset,
  removeAsset
};
