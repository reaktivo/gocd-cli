const Request = require('../lib/request');
const arg = require('../lib/arg');
const StringHelper = require('../helpers/string');
const chalk = require('chalk');

class Schedule {

  constructor(options) {
    Promise.resolve(options)
      .then(options => arg.pipeline(options))
      .then(this.scheduleJob.bind(this))
      .then(this.handleScheduleJob.bind(this))
      .catch(err => { cn.log(err.stack); throw new Error(err) });
  }

  scheduleJob(options) {
    this.pipeline = options.pipeline;
    const form = StringHelper.parseEnv(options.env);
    return Request(options)({
      method: 'POST',
      uri: `/api/pipelines/${options.pipeline}/schedule`,
      form: form,
      headers: {
        'Confirm': 'true'
      }
    });
  }

  handleScheduleJob({ statusCode, body }) {
    // statusCode is 409 when failed
    // statusCode is 202 when successful
    console.log(body);
    if (body.indexOf(`Request to schedule pipeline ${this.pipeline} accepted`) < 0) {
      process.exit(1);
    } else{
      console.log(chalk.green('Success'));
      // TODO: Run logs with same arguments after success
    }
  }
}

module.exports = Schedule;
