const inquirer = require('inquirer');
const url = require('url');
const chalk = require('chalk');
const extend = Object.assign.bind(Object);
const Request = require('./request');
const ini = require('./ini')();

module.exports = {
  inquire: function inquire(options, key, choices) {
    if (choices.length === 0) {
      throw new Error(`No options available for ${key}`);
    }

    const defaultIndex = choices.indexOf(options[key]);
    if (defaultIndex >= 0) {
      return extend({}, options, {[key]: choices[defaultIndex]})
    }

    if (choices.length === 1) {
      return extend({}, options, {[key]: choices[0]});
    }

    return inquirer.prompt([{
      choices,
      type: 'list',
      name: key,
      message: `Please pick a ${key}`
    }]).then(answers => extend({}, options, answers));
  },

  secret: function secret(options, key) {
    if (options[key]) {
      return Promise.resolve(options);
    };

    return inquirer.prompt([{
      type: 'password',
      name: key,
      message: `Please specify secret ${key} value`
    }]).then(answers => extend({}, options, answers));
  },

  text: function text(options, key) {
    if (options[key]) {
      return Promise.resolve(options);
    }

    return inquirer.prompt([{
      type: 'input',
      name: key,
      message: `Please specify ${key}`
    }]).then(answers => extend({}, options, answers));
  },

  data: function data(options) {
    return Promise.resolve(options)
      .then(options => this.session(options))
      .then(options => this.endpoint(options))
      .then(options => this._requestGroup(options));
  },

  _requestGroup: function requestGroup(options) {
    return options.groups
      ? Promise.resolve(options)
      : Request(options)({
          json: true,
          simple: false,
          url: '/api/config/pipeline_groups'
        }).then(({ body, statusCode }) => {
          if (statusCode === 401) {
            console.log('Session invalid or expired.');
            return this._retryWithNewSession(options);
          }
          return extend({}, options, { groups: body });
        }
        );
  },

  _retryWithNewSession: function _retryWithNewSession(options) {
    delete options['session'];
    return this.session(options, true)
      .then(options => this._requestGroup(options));
  },

  group: function group(options) {
    return this.data(options).then(options => {
      /**
       * When data for groups, pipelines and stages has been loaded
       * try to automatically select group based on pipeline passed.
       *
       * TODO: Check if two pipelines with same name in different
       * groups can exists. This would be a problem since currently
       * we're just looking for the first group that contains a
       * pipeline with the pipeline name;
       */

      if (options.pipeline && !options.group) {
        const group = options.groups.find(group =>
          group.pipelines.find(pipeline => pipeline.name === options.pipeline)
        );
        options.group = group && group.name;
      }
      const groupChoices = options.groups.map(group => group.name);
      return this.inquire(options, 'group', groupChoices);
    });
  },

  _mapPipelinesToChoices: function _mapPipelinesToChoices(options, pipelines) {
    if (!options.pipelineFilter) {
      return Promise.resolve(pipelines.map(pipeline => pipeline.name));
    }

      const Status = require('../commands/status');
      const statusCmd = new Status();
      const statusOptions = extend({}, options, {
        internal: true,
        pipeline: pipeline.name,
        pipelineFilter: false,
      });
      return statusCmd.run(statusOptions).then(mapPipelineWithStatus);
    }));
  },

  pipeline: function pipeline(options, listOptions) {
    return this.group(options).then(options => {
      const group = options.groups.find(group => group.name === options.group);
      return this._mapPipelinesToChoices(options, group.pipelines)
        // .then(choices => {
        //   // TODO move logic outside pipeline method, asterisk select should
        //   // not work for any other command than schedule.
        //   if (options.pipeline === '*') {
        //     const pipeline = choices.find(pipeline => !pipeline.disabled);
        //     if (!pipeline) {
        //       return Promise.reject('No pipelines available');
        //     }
        //     console.log("HEREEEE", pipeline.name);
        //     options.pipeline = pipeline.name;
        //   }
        //   return choices;
        // })
        // .then(choices => choices.map(choice => choice.name))
        .then(choices => this.inquire(options, 'pipeline', choices));
    });
  },

  stage: function stage(options) {
    return this.pipeline(options).then(options => {
      const pipeline = group.pipelines.find(pipeline => pipeline.name === options.pipeline);
      const stageChoices = pipeline.stages.map(stage => stage.name);
      return this.inquire(options, 'stage', stageChoices);
    });
  },

  endpoint: function endpoint(options) {
    const config = ini.read();
    if (!options.endpoint && config.endpoint) {
      options.endpoint = config.endpoint;
    }

    return this.text(options, 'endpoint').then(options => {
      config.endpoint = options.endpoint;
      ini.write(config);
      return options;
    });
  },

  session: function session(options, skipConfig) {
    const config = ini.read();
    if (!skipConfig && !options.session && config.session) {
      options.session = config.session;
    }

    return this.secret(options, 'session').then(options => {
      config.session = options.session;
      ini.write(config);
      return options;
    });
  }
};
