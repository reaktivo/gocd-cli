const Request = require('../lib/request');
const { mapValues, capitalize } = require('lodash');
const chalk = require('chalk');
const { humanizeBoolean } = require('../helpers/string');
const stdout = require('../helpers/stdout');
const Options = require('../lib/options');

class Status {

  constructor(options) {
    this.write = stdout.write;
    this.request = Request(options);
    this.run(options);
  }

  run(options) {
    Promise.resolve(options)
      .then(options => Options.pipeline(options))
      .then(this.loadStatus.bind(this))
      .then(this.handleStatusLoad.bind(this));
  }

  loadStatus(options) {
    return this.request({
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
