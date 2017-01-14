function getGCD(a, b) {
  return b === 0 ? a : getGCD(b, a % b);
}

module.exports = function(width, height) {
  if (!width || !height) {
    return null;
  }
  const gcd = getGCD(width, height);
  return `${width / gcd}:${height / gcd}`;
};
