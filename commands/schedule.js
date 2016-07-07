const Request = require('../lib/request');
const arg = require('../lib/arg');
const StringHelper = require('../helpers/string');
const chalk = require('chalk');
const stdout = require('../helpers/stdout');

class Schedule {

  run(options) {
    options.pipelineFilter = 'schedulable';
    return Promise.resolve(options)
      .then(options => arg.pipeline(options))
      .then(options => this.scheduleJob(options))
      .then(options => this.switchToLogMode(options));
  }

  scheduleJob(options) {
    const form = StringHelper.parseEnv(options.env);

    return Request(options)({
      simple: false,
      method: 'POST',
      uri: `/api/pipelines/${options.pipeline}/schedule`,
      form: form,
      headers: {
        'Confirm': 'true'
      }
    })
    .then(response => this.handleScheduleJob(response))
    .then(() => options);
  }

  handleScheduleJob(response) {
    const { statusCode, body } = response;

    if (statusCode !== 202) {
      stdout.write(chalk.red(body || 'Failed to schedule job, probably pipeline is busy'));
      process.exit(1);
      return;
    }

    stdout.write(chalk.green(body || 'Successfully scheduled job'));
    return Promise.resolve(response);
  }

  switchToLogMode(options) {
    stdout.write('Switching to Log view');
    const Logs = require('../commands/logs');
    options = Object.assign({}, options, { pipelineFilter: null });
    return (new Logs()).run(options);
  }
}

module.exports = Schedule;
