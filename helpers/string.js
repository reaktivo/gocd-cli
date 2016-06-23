module.exports = {

  countNumberOfLines: function countNumberOfLines(str) {
    str = String(str).trim();
    return str.length ? str.split(/\r\n|\r|\n/).length : 0;
  },

  parseSessionId: function parseSessionId(sessionStr) {
    return sessionStr
      .split("JSESSIONID=")
      .pop()
      .split(";")
      .shift();
  },

  toBool: function(value) {
    if (typeof value === 'string') {
      if (value === 'true') {
        return true;
      } else if (value === 'false') {
        return false;
      }
    }
    return !!value;
  }
}
