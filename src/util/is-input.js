export default node => {
  if (node.contentEditable === 'true') {
    return true;
  }
  const tagName = node.tagName.toUpperCase();
  return tagName === 'INPUT' || tagName === 'TEXTAREA';
};
