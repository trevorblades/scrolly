function getGCD(a, b) {
  return b === 0 ? a : getGCD(b, a % b);
}

export default (width, height) => {
  if (!width || !height) {
    return null;
  }
  const gcd = getGCD(width, height);
  return `${width / gcd}:${height / gcd}`;
};
