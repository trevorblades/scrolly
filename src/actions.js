function addLayer(type) {
  return {
    type: 'ADD_LAYER',
    layerType: type
  };
}

function addImageLayer(asset) {
  return Object.assign(addLayer('image'), {asset});
}

function addShapeLayer(shape) {
  return Object.assign(addLayer('shape'), {shape});
}

function removeLayer(id) {
  return {
    type: 'REMOVE_LAYER',
    id
  };
}

function copyLayer(id) {
  return {
    type: 'COPY_LAYER',
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
  let clamped = value;
  if (clamped < 0) {
    clamped = 0;
  } else if (clamped > 1) {
    clamped = 1;
  }

  return {
    type: 'SET_PERCENT_PLAYED',
    clamped
  };
}

function selectLayer(id) {
  return {
    type: 'SELECT_LAYER',
    id
  };
}

function loadProject(project) {
  return {
    type: 'LOAD_PROJECT',
    id: project.id,
    slug: project.slug,
    name: project.name,
    width: project.width,
    height: project.height,
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
  addShapeLayer,
  removeLayer,
  copyLayer,
  orderLayers,
  setLayerProperties,
  toggleLayerVisibility,
  linkLayers,
  setPercentPlayed,
  selectLayer,
  loadProject
};
