'use strict';
module.exports = function(options) {

/* TODO: Refactor into lib file, rename also */
  const inquirer = require('inquirer');
  const url = require('url');
  const chalk = require('chalk');
  const lodash = require('lodash');
  const map = lodash.map;
  const find = lodash.find;
  const extend = lodash.extend;
  const flatten = lodash.flatten;
  const Request = require('./lib/request');
  const request = Request(options);

  return {

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

    data: function data(options) {
       return request({ url: '/api/config/pipeline_groups' })
        .then(body => JSON.parse(body))
        .then(groups => extend({}, options, { groups }));
    },

    group: function group(options) {
      return this.data(options).then(options => {
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
    }
  }
}




