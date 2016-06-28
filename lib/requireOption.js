/**
 * TODO: Refactor main.js into this file.
 */

module.exports = (optionToRequire) => {
  return (options) => {
    const main = require('../main')(options);
    return main[optionToRequire](options);
  }
}
