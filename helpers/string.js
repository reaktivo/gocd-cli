module.exports = {
  countNumberOfLines: function countNumberOfLines(str) {
    str = String(str).trim();
    return str.length ? str.split(/\r\n|\r|\n/).length : 0;
  }
}
