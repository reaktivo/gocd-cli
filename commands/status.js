module.exports = options => {

  const _ = require('lodash');
  const chalk = require('chalk');

  const request = require('../lib/request')(options);

  function loadStatus() {
    request({
      url: `/api/pipelines/${options.pipeline}/status`
    }, handleStatusLoad);
  }

  function mapBoolean(val) {
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    };
    return val;
  }

  function handleStatusLoad(err, response, body) {
    if (err) throw new Error(err);
    if (response) {
      if (response.statusCode === 404) {
        throw new Error(`Status for pipeline ${options.pipeline} not found: 404`);
      } else if (response.statusCode !== 200) {
        throw new Error('Unexpected http error');
      }
    }

    const json = JSON.parse(body);
    const logs = _.mapValues(json, (value, key) => {
      return `${chalk.bold(_.capitalize(key))}: ${mapBoolean(value)}`;
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

  loadStatus();
}
