let nextLayerId = 0;
let nextAssetId = 0;

function addLayer(type) {
  return {
    type: 'ADD_LAYER',
    id: nextLayerId++,
    layerType: type
  };
}

function addImageLayer(src, width, height) {
  return Object.assign({}, addLayer('image'), {src, width, height});
}

function removeLayer(id) {
  return {
    type: 'REMOVE_LAYER',
    id
  };
}

function orderLayers(order) {
  return {
    type: 'ORDER_LAYERS',
    order
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

function linkLayers(child, parent) {
  return {
    type: 'LINK_LAYERS',
    child,
    parent
  };
}

function addAsset(name, filetype, size, data, width, height) {
  return {
    type: 'ADD_ASSET',
    id: nextAssetId++,
    name,
    filetype,
    size,
    data,
    width,
    height
  };
}

function removeAsset(id) {
  return {
    type: 'REMOVE_ASSET',
    id
  };
}

function changeStep(value) {
  return {
    type: 'CHANGE_STEP',
    value
  };
}

module.exports = {
  addLayer,
  addImageLayer,
  removeLayer,
  orderLayers,
  setLayerProperties,
  toggleLayerVisibility,
  linkLayers,
  addAsset,
  removeAsset,
  changeStep
};
