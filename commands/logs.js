const { extend, find, map } = require('lodash');
const { countNumberOfLines } = require('../helpers/string');
const Request = require('../lib/request');
const Inquire = require('../lib/inquire');
const requireOptions = require('../lib/requireOptions');
const chalk = require('chalk');
const pretty = require('pretty-js');

module.exports = class Logs {

  constructor(options) {
    this.request = Request(options).request;
    this.inquire = Inquire(options);
    this.normalizeOptions(options)
      .then(requireOptions(['pipeline']))
      .then(this.loadHistory.bind(this))
      .then(this.parseHistory.bind(this))
      .then(this.log.bind(this))
      .catch(err => { console.log(err.stack); throw new Error(err) });
  }

  normalizeOptions(options) {
    this.stage = options.stage;
    this.startLineNumber = parseInt(options.startLineNumber || 0, 10);
    this.interval = parseInt(options.interval || 1000, 10);

    return Promise.resolve(options);
  }

  loadHistory(options) {
    const pipeline = options.pipeline;
    return this.request(`/api/pipelines/${pipeline}/history`)
      .then(body => JSON.parse(body));
  }

  parseHistory(json) {
    return new Promise((resolve, reject) => {
      if (!json.pipelines || !json.pipelines.length){
        throw new Error('No pipelines available');
      }

      const pipeline = json.pipelines.shift();

      return this.findStage(pipeline.stages, this.stage)
        .then(stage => resolve({
          pipeline: pipeline.name,
          pipelineLabel: pipeline.label,
          stage: stage.name,
          stageCounter: stage.counter,
          jobName: stage.jobs[0].name
        }));
    });
  }

  log({ pipeline, pipelineLabel, stage, stageCounter, jobName }) {
    const url = [
      'files',
      pipeline,
      pipelineLabel,
      stage,
      stageCounter,
      jobName,
      'cruise-output',
      'console.log'
    ].join('/');

    const qs = {
      ms: `${Date.now()}_2`,
      startLineNumber: this.startLineNumber
    }
    setTimeout(() => this.log(arguments[0]), this.interval);
    return this.request({ url, qs }).then(body => this.handleLog(body));
  }

  handleLog(body) {
    process.stdout.write(body);
    this.startLineNumber += countNumberOfLines(body);
  }

  findStage(stages, stageName) {
    return new Promise((resolve, reject) => {
      if (stageName) {
        const stage = find(stages, { name: stageName });
        if (!stage) {
          throw new Error(`No stage by that name: ${stageName}`);
        };

        return resolve(stage);
      }

      if (stages.length === 0) {
        throw new Error('No stages available');
      }

      if (stages.length === 1) {
        return resolve(stages[0]);
      }

      return this.inquire('stage', map(stages, 'name')).then(stageName => stages[stageName]);
    });
  }
}


