const Request = require('../lib/request');
const { mapValues, capitalize } = require('lodash');
const chalk = require('chalk');
const { humanizeBoolean } = require('../helpers/string');
const stdout = require('../helpers/stdout');
const arg = require('../lib/arg');

class Status {

  run(options) {
    return Promise.resolve(options)
      .then(options => arg.pipeline(options))
      .then(options => this.loadStatus(options))
  }

  loadStatus(options) {
    return Request(options)({
      json: true,
      url: `/api/pipelines/${options.pipeline}/status`
    }).then(response => (
      this.handleStatusLoad(options, response.body)
    ));
  }

  handleStatusLoad(options, json) {

    // Use internal flag when we only want to use status info
    // without printing to stdout.
    if (!options.internal) {

      const logs = mapValues(json, (value, key) => {
        value = humanizeBoolean(value);
        return `${capitalize(key)}: ${chalk.bold(value)}`;
      });

      stdout.write([
        chalk.bold.underline.cyan('Status'),
        logs.schedulable,
        logs.locked,
        logs.paused,
      ]);

      json.paused && stdout.write([
        logs.pausedBy,
        logs.pausedCause
      ]);
    }

    return json;
  }
}

module.exports = Status;
