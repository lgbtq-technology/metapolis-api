function extFor(type) {
  const m = /^image\/(.*)/.exec(type)
  if (m) {
    return m[1];
  } else {
    throw new Error(`${type} is not a recognized type`);
  }
}

module.exports = extFor;
