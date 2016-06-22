const { extend, find, map } = require('lodash');
const { countNumberOfLines, toBool } = require('../helpers/string');
const { inquire } = require('../lib/inquire');
const Request = require('../lib/request');
const requireOptions = require('../lib/requireOptions');
const chalk = require('chalk');
const pretty = require('pretty-js');

module.exports = class Logs {

  constructor(options) {
    this.request = new Request(options);
    this.inquire = inquire;
    this.normalizeOptions(options)
      .then(requireOptions(['pipeline']))
      .then(this.loadHistory.bind(this))
      .then(this.parseHistory.bind(this))
      .then(options => {
        this.pollJobStatus(options);
        this.log(options);
      })
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
    return this.request.get(`/api/pipelines/${pipeline}/history`)
      .then(body => JSON.parse(body));
  }

  parseHistory({ pipelines }) {
    return new Promise((resolve, reject) => {
      if (!pipelines || !pipelines.length){
        throw new Error('No pipelines available');
      }

      const pipeline = pipelines[0];

      return this.findStage(pipeline.stages, this.stage)
        .then(stage => resolve({
          pipeline: pipeline.name,
          pipelineLabel: pipeline.label,
          stage: stage.name,
          stageCounter: stage.counter,
          jobName: stage.jobs[0].name,
          jobId: stage.jobs[0].id
        }));
    });
  }

  pollJobStatus({ pipeline, stage, jobId }) {
    this.request.get({
      url: 'jobStatus.json',
      qs: {
        pipelineName: pipeline,
        stageName: stage,
        jobId: jobId
      }
    })
    .then(data => JSON.parse(data))
    .then(data => this.jobStatus = data[0].building_info);

    this.jobStatusPoller = setTimeout(() => this.pollJobStatus(arguments[0]), this.interval);
  }

  checkJobStatus() {
    const { is_completed, result } = this.jobStatus;
    const isSuccess = (result === 'Passed')
    const decorator =  isSuccess ? chalk.bold.green : chalk.bold.red;

    if (toBool(is_completed)) {
      clearTimeout(this.logPoller);
      clearTimeout(this.jobStatusPoller);
      console.log(chalk.bold.underline.cyan('\nJob status'));
      console.log(`Result: ${decorator(result)}\n`);
      isSuccess || process.exit(-1);
    }
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

    this.logPoller = setTimeout(() => this.log(arguments[0]), this.interval);
    return this.request.get({ url, qs }).then(body => this.handleLog(body));
  }

  handleLog(body) {
    this._stdoutWrite(body);
    this.startLineNumber += countNumberOfLines(body);
    this.checkJobStatus();
  }

  _stdoutWrite(str) {
    process.stdout.write(str);
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

      return this.inquire('stage', map(stages, 'name'))
        .then(stageName => this.findStage(stages, stageName));
    });
  }
}


