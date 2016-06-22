module.exports = (optionsToRequire) => {
  return (options) => {
    const main = require('../main')(options);
    return optionsToRequire
      .map((method) => main[method](options))
      .reduce((promise, nextPromise) => promise.then(nextPromise));
  }
}
