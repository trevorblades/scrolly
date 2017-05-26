import getInterpolatedValue from './get-interpolated-value';

export default (parents, percentPlayed) => {
  const parent = parents[0];
  let x = getInterpolatedValue(parent.x, percentPlayed);
  let y = getInterpolatedValue(parent.y, percentPlayed);
  let scale = getInterpolatedValue(parent.scale, percentPlayed);
  let opacity = getInterpolatedValue(parent.opacity, percentPlayed);

  const layers = parents.slice(1);
  layers.forEach(layer => {
    const offsetScale = scale / layer.parent.offsetScale;
    x +=
      (getInterpolatedValue(layer.x, percentPlayed) - layer.parent.offsetX) *
      offsetScale;
    y +=
      (getInterpolatedValue(layer.y, percentPlayed) - layer.parent.offsetY) *
      offsetScale;
    scale *=
      getInterpolatedValue(layer.scale, percentPlayed) /
      layer.parent.offsetScale;
    opacity *= getInterpolatedValue(layer.opacity, percentPlayed);
  });

  return {x, y, scale, opacity};
};
