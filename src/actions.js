let nextLayerId = 0;

function addLayer(type) {
  return {
    type: 'ADD_LAYER',
    id: nextLayerId++,
    layerType: type
  };
}

function addImageLayer(asset) {
  return Object.assign({}, addLayer('image'), {asset});
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

function setPercentPlayed(value) {
  return {
    type: 'SET_PERCENT_PLAYED',
    value
  };
}

function selectLayer(id) {
  return {
    type: 'SELECT_LAYER',
    id
  };
}

function updateProject(project) {
  return {
    type: 'UPDATE_PROJECT',
    id: project.id,
    slug: project.slug,
    name: project.name,
    layers: project.layers,
    assets: project.assets,
    step: project.step,
    createdAt: project.created_at,
    updatedAt: project.updated_at
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
  setPercentPlayed,
  selectLayer,
  updateProject
};
