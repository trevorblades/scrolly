const upperCaseFirst = require('upper-case-first');

let layerIndex = 0;

const Layer = function(options) {
  if (!options) {
    throw new Error('Layer instantiated with no options');
  } else if (!options.type) {
    throw new Error('Layer instantiated with no type');
  }

  const layer = {
    name: options.name || `${upperCaseFirst(options.type)} layer`,
    visible: true,
    x: 'x' in options ? options.x : 0,
    y: 'y' in options ? options.y : 0,
    in: 'in' in options ? options.in : 0,
    out: 'out' in options ? options.out : 1
  };

  function getProp(prop) {
    return layer[prop];
  }

  function setProp(prop, value) {
    layer[prop] = value;
    if (this.onChange) {
      this.onChange();
    }
  }

  const properties = Object.keys(layer).reduce((obj, prop) => {
    obj[prop] = {
      get: getProp.bind(this, prop),
      set: setProp.bind(this, prop)
    };
    return obj;
  }, {});
  properties.id = {value: new Date().valueOf() + layerIndex};
  properties.type = {value: options.type};
  properties.properties = {value: layer};
  Object.defineProperties(this, properties);

  layerIndex++;
};

module.exports = Layer;
