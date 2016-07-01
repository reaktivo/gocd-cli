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
        obj[`variables[${key}]`] = value || process.env[key];
        return obj;
      },
      {});
  },

  parseSessionId: function parseSessionId(sessionStr) {
    if (typeof sessionStr !== 'string') {
      throw new Error('Invalid session value');
    }

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
  },

  humanizeBoolean(val) {
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    };
    return val;
  }

}
