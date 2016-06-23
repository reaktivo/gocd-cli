const Request = require('../lib/request');
const requireOptions = require('../lib/requireOptions');
const chalk = require('chalk');

module.exports = class Logs {

  constructor(options) {
    this.request = Request(options);
    requireOptions(['pipeline'])(options)
      .then(this.scheduleJob.bind(this))
      .then(this.handleScheduleJob.bind(this))
      .catch(err => { console.log(err.stack); throw new Error(err) });
  }

  scheduleJob(options) {
    return this.request({
      method: 'POST',
      uri: `/api/pipelines/${options.pipeline}/schedule`,
      form: {
        "variables[GO_STORY]": "CFE-8379-vaycom-the-loading-page-should-",
        "variables[BRAND_ENV]": "vayama",
        "variables[API_URL]": "//api.staging.vayama.ie",
        "variables[COUNTRY_ENV]": "IE",
        "variables[DEFAULT_LANGUAGE]": "en",
        "variables[UPSELL_API_URL]": "//upsellapi.cheaptickets.nl"
      }
    });
  }

  handleScheduleJob(response) {
    // Should check if response body is successful with:
    // Request to schedule pipeline Little.Penguin accepted

    console.log(response);
    if (response.indexOf('Request to schedule pipeline Little.Penguin accepted') < 0) {
      process.exit('-1');
    } else{
      console.log(chalk.green('Success'));
    }
  }

}


