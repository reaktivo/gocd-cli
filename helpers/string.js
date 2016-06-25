module.exports = {

  countNumberOfLines: function countNumberOfLines(str) {
    str = String(str).trim();
    return str.length ? str.split(/\r\n|\r|\n/).length : 0;
  },

  parseEnv(str) {
    return str && String(str).split(' ')
      .filter(Boolean)
      .map(str => str.split('='))
      .reduce((obj, [key, value]) => {
        obj[`variables[${key}]`] = value;
        return obj;
      },
      {});
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
