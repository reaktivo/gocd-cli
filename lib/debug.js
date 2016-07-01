const util = require('util');

module.exports = function debug() {
  const isDebugging = process.env.NODE_DEBUG && /\bgocd\b/.test(process.env.NODE_DEBUG);
  console.error('GOCD %s', util.format.apply(util, arguments))
}
