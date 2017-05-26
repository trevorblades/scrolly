export const addLayer = type => ({
  type: 'ADD_LAYER',
  layerType: type
});

export const addImageLayer = asset => Object.assign(addLayer('image'), {asset});

export const addShapeLayer = shape => Object.assign(addLayer('shape'), {shape});

export const removeLayer = id => ({
  type: 'REMOVE_LAYER',
  id
});

export const copyLayer = id => ({
  type: 'COPY_LAYER',
  id
});

export const orderLayers = order => ({
  type: 'ORDER_LAYERS',
  order
});

export const setLayerProperties = (id, properties) => ({
  type: 'SET_LAYER_PROPERTIES',
  id,
  properties
});

export const toggleLayerVisibility = id => ({
  type: 'TOGGLE_LAYER_VISIBILITY',
  id
});

export const linkLayers = (child, parent) => ({
  type: 'LINK_LAYERS',
  child,
  parent
});

export const setPercentPlayed = value => {
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
};

export const selectLayer = id => ({
  type: 'SELECT_LAYER',
  id
});

export const loadProject = project => ({
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
});
