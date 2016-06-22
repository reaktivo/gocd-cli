module.exports = (options) => {
  const { mapValues, capitalize } = require('lodash');
  const chalk = require('chalk');

  const Request = require('../lib/request');
  const request = new Request(options);

  run();

  function run() {
    loadStatus()
      .then(handleStatusLoad);
  }

  function loadStatus() {
    return request({
      url: `/api/pipelines/${options.pipeline}/status`
    }).then(body => JSON.parse(body));
  }

  function mapBoolean(val) {
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    };
    return val;
  }

  function handleStatusLoad(json) {
    const logs = mapValues(json, (value, key) => {
      return `${capitalize(key)}: ${chalk.bold(mapBoolean(value))}`;
    });

    console.log('');
    console.log(chalk.bold.underline.cyan('Status for', options.pipeline));
    console.log(logs.schedulable);
    console.log(logs.locked);
    console.log(logs.paused);
    if (json.paused) {
      console.log(logs.pausedBy);
      console.log(logs.pausedCause);
    }
  }

}
