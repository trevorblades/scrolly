let nextLayerId = 0;

function addLayer() {
  return {
    type: 'ADD_LAYER',
    id: nextLayerId++
  };
}

function deleteLayer(id) {
  return {
    type: 'DELETE_LAYER',
    id
  };
}

function toggleLayerVisibility(id) {
  return {
    type: 'TOGGLE_LAYER_VISIBILITY',
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

module.exports = {
  addLayer,
  deleteLayer,
  toggleLayerVisibility,
  setLayerProperties
};
