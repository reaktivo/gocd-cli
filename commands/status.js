const Request = require('../lib/request');
const { mapValues, capitalize } = require('lodash');
const chalk = require('chalk');
const { humanizeBoolean } = require('../helpers/string');
const stdout = require('../helpers/stdout');
const arg = require('../lib/arg');

class Status {

  constructor(options) {
    this.write = stdout.write;
    this.run(options);
  }

  run(options) {
    Promise.resolve(options)
      .then(options => arg.pipeline(options))
      .then(options => this.loadStatus(options))
      .then(options => this.handleStatusLoad(options));
  }

  loadStatus(options) {
    return Request(options)({
      json: true,
      url: `/api/pipelines/${options.pipeline}/status`
    }).then(response => response.body);
  }

  handleStatusLoad(json) {
    const logs = mapValues(json, (value, key) => {
      value = humanizeBoolean(value);
      return `${capitalize(key)}: ${chalk.bold(value)}`;
    });

    this.write([
      chalk.bold.underline.cyan('Status'),
      logs.schedulable,
      logs.locked,
      logs.paused,
    ]);

    json.paused && this.write([
      logs.pausedBy,
      logs.pausedCause
    ]);
  }
}

module.exports = Status;
