const inquirer = require('inquirer');
const url = require('url');
const chalk = require('chalk');
const { map, find } = require('lodash');
const extend = Object.assign.bind(Object);
const Request = require('./request');

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
    return Request(options)(
      { json: true, url: '/api/config/pipeline_groups' }
    ).then(({ body }) => {
      return extend({}, options, { groups: body })
    }
    );
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
        const group = find(options.groups, group =>
          find(group.pipelines, { name: options.pipeline })
        );
        options.group = group && group.name;
      }
      const groupChoices = map(options.groups, 'name');
      return this.inquire(options, 'group', groupChoices);
    });
  },

  pipeline: function pipeline(options) {
    return this.group(options).then(options => {
      const group = find(options.groups, { name: options.group });
      const pipelineChoices = map(group.pipelines, 'name');
      return this.inquire(options, 'pipeline', pipelineChoices);
    });
  },

  stage: function stage(options) {
    return this.pipeline(options).then(options => {
      const pipeline = find(group.pipelines, { name: options.pipeline });
      const stageChoices = map(pipeline.stages, 'name');
      return this.inquire(options, 'stage', stageChoices);
    });
  },

  endpoint: function endpoint(options) {
    return this.text(options, 'endpoint');
  },

  session: function session(options) {
    return this.secret(options, 'session');
  }
};
