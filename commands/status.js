const Request = require('../lib/request');
const { mapValues, capitalize } = require('lodash');
const chalk = require('chalk');
const { humanizeBoolean } = require('../helpers/string');
const stdout = require('../helpers/stdout');
const requireOption = require('../lib/requireOption');

class Status {

  constructor(options) {
    this.write = stdout.write;
    this.request = Request(options);
    this.requireOption = requireOption;
    this.run(options);
  }

  run(options) {
    Promise.resolve(options)
      .then(this.requireOption('pipeline'))
      .then(this.loadStatus.bind(this))
      .then(this.handleStatusLoad.bind(this));
  }

  loadStatus(options) {
    return this.request({
      url: `/api/pipelines/${options.pipeline}/status`
    }).then(({ body }) => JSON.parse(body));
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
